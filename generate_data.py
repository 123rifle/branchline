#!/usr/bin/env python3
"""Generates the synthetic demo datasets used by the Branchline admin dashboard.
Run:  python3 tools/generate_data.py      (writes data/*.json and data/bundle.js)
All numbers are DEMO data. Replace the JSON files with real exports to study real usage.
"""
import json, random, math, datetime as dt, os
random.seed(20261115)
OUT = os.path.join(os.path.dirname(__file__), '..', 'data')
AS_OF = dt.date(2026, 11, 15); LAUNCH = dt.date(2025, 12, 1)
ND = (AS_OF - LAUNCH).days + 1
D = lambda i: LAUNCH + dt.timedelta(days=i)
CATS = ['Business','Relationships','Life Decisions','Technology','Psychology','Entertainment','Education','Hypotheticals','Personal Growth']
def wchoice(pairs):
    r = random.random() * sum(w for _, w in pairs)
    for v, w in pairs:
        r -= w
        if r <= 0: return v
    return pairs[-1][0]
def poisson(l):
    if l <= 0: return 0
    if l > 30: return max(0, int(random.gauss(l, math.sqrt(l))))
    L, k, p = math.exp(-l), 0, 1
    while True:
        p *= random.random()
        if p <= L: return k
        k += 1
FN = "Aisha Omar Lena Mateo Zara Noah Priyanka Kenji Amara Lucas Fatima Ethan Sofia Ravi Chloe Hassan Maya Diego Ines Jonas Nia Tariq Elena Samir Hannah Yusuf Camila Arjun Freya Malik Isla Rohan Thandi Oscar Leila Felix Anika Bilal Mei Tomas Sara Idris Greta Kofi Naomi Dev Ayesha Luca Rania Sam Joy Ahmed Clara Vikram Tess Zain Ola Mina Ibrahim Alba".split()
LN = "Khan Silva Okoye Patel Nguyen Rossi Haddad Moreau Tanaka Bauer Ahmed Costa Singh Larsen Mensah Garcia Ali Novak Santos Ibrahim Meyer Dubois Chowdhury Reyes Yilmaz Walker Kim Abbasi Hughes Ortiz Malik Fischer Olsen Gupta Baker Rahim Lopez Evans Sheikh Murray Diaz Qureshi Park Bennett Cohen Adeyemi Romero Hussain Wood".split()
COUNTRIES = [('United States',24),('United Kingdom',10),('Pakistan',9),('India',11),('Canada',6),('Germany',5),('Australia',5),('Nigeria',5),('Brazil',5),('UAE',4),('France',3),('Philippines',3),('South Africa',3),('Other',7)]
SOURCES = [('organic',32),('referral',20),('social',22),('search',14),('paid',8),('creator',4)]
DEVICES = [('iOS',44),('Android',31),('Web',25)]
ARCH = {  # p=daily active prob, spd=sessions/active day, mps=minutes/session, per-session interaction rates, hazard=daily churn
 'power':  dict(p=.72,spd=2.6,mps=8.5,v=4.2,l=3.0,c=.9,b=.5,s=.35,w=12,h=.0005),
 'regular':dict(p=.34,spd=1.8,mps=6.0,v=2.6,l=1.6,c=.35,b=.2,s=.12,w=8,h=.002),
 'casual': dict(p=.12,spd=1.3,mps=4.0,v=1.6,l=.8,c=.08,b=.08,s=.05,w=5,h=.006),
 'lurker': dict(p=.04,spd=1.1,mps=3.0,v=.9,l=.3,c=.01,b=.02,s=.01,w=3.5,h=.012)}
PRICE = {('plus','monthly'):6,('plus','annual'):5,('creator','monthly'):14,('creator','annual'):140/12}
PERSONAS = [('mara','Mara Okafor','maraokafor','power',2,1),('devon','Devon Hale','devonhale','regular',5,0),('sana','Dr. Sana Iqbal','drsanaiqbal','power',4,1),
            ('theo','Theo Lindqvist','theolind','regular',9,0),('priya','Priya Nair','priyanair','regular',12,0),('me','Alex Rahman','alexr','regular',40,0)]
users, used = [], set()
def mkuser(uid, name, un, arch, j, ver):
    u = dict(id=uid, name=name, username=un, email=f'{un}@example.com', country=wchoice(COUNTRIES), device=wchoice(DEVICES), source=wchoice(SOURCES),
             archetype=arch, verified=bool(ver), joined=str(D(j)), _j=j)
    users.append(u); used.add(un)
for pid, n, un, a, j, v in PERSONAS: mkuser(pid, n, un, a, j, v)
mkuser_i = 0
while len(users) < 480:
    n = f'{random.choice(FN)} {random.choice(LN)}'; un = (n.lower().replace(' ', '') + str(random.randint(1, 99)))
    if un in used: continue
    mkuser_i += 1
    j = int((ND - 1) * random.random() ** .55)
    a = wchoice([('power',12),('regular',30),('casual',38),('lurker',20)])
    mkuser(f'u{len(users):03d}', n, un, a, j, random.random() < .015)
users[5]['country'] = 'Pakistan'; users[5]['device'] = 'Web'
# ---- activity simulation
DAYKEYS = ['sessions','minutes','votes','likes','comments','bookmarks','shares','views']
agg = [{k: 0 for k in DAYKEYS} for _ in range(ND)]
for u in users:
    A = ARCH[u['archetype']]; j = u['_j']; act = [False] * ND
    tot = {k: 0 for k in DAYKEYS}; dm = [0] * ND
    churn_at = ND + 999
    for d in range(j, ND):
        if random.random() < A['h']: churn_at = d; break
    for d in range(j, min(ND, churn_at)):
        age = d - j; mod = .65 + .35 * math.exp(-age / 45); wk = 1.12 if D(d).weekday() >= 5 else 1
        if d == j or random.random() < A['p'] * mod * wk:
            act[d] = True; s = 1 + poisson((A['spd'] - 1) * 1.0)
            mins = sum(max(.5, random.lognormvariate(math.log(A['mps']), .5)) for _ in range(s))
            vals = dict(sessions=s, minutes=mins, votes=poisson(s*A['v']), likes=poisson(s*A['l']), comments=poisson(s*A['c']),
                        bookmarks=poisson(s*A['b']), shares=poisson(s*A['s']), views=poisson(s*A['w']))
            vals['views'] = max(vals['views'], vals['votes'])
            for k in DAYKEYS: tot[k] += vals[k]; agg[d][k] += vals[k]
            dm[d] = mins
    u['_act'] = act; u['_tot'] = tot; u['_dm'] = dm
    ad = [i for i in range(ND) if act[i]]
    u['_last'] = ad[-1]
# ---- subscriptions
for u in users:
    u['_segs'] = []; A = u['archetype']
    pp = dict(power=.35, regular=.12, casual=.03, lurker=.005)[A]
    if u['id'] in ('mara','sana'): pp = 1
    if random.random() < pp:
        start = u['_j'] + random.randint(0, 45)
        if start >= ND: continue
        plan = 'creator' if (random.random() < .3 or u['id'] == 'mara') else 'plus'
        bill = 'annual' if random.random() < .35 else 'monthly'
        end = None
        if bill == 'monthly':
            k = start
            while True:
                k += 30
                if k >= ND: break
                if random.random() < .055 and u['id'] not in ('mara', 'sana'): end = k; break
        elif start + 365 <= ND and random.random() < .3: end = start + 365
        segs = [[start, end, plan, bill]]
        if plan == 'plus' and end is None and bill == 'monthly' and random.random() < .12 and ND - start > 60:
            up = start + random.randint(30, ND - start - 1); segs = [[start, up, 'plus', bill], [up, None, 'creator', bill]]
        u['_segs'] = segs
def seg_price(sg): return PRICE[(sg[2], sg[3])]
def mrr_at(u, d): return sum(seg_price(s) for s in u['_segs'] if s[0] <= d and (s[1] is None or d < s[1]))
# ---- posts
SEED = [  # id, creator, cat, hours ago, likes, title, choices
 ('s1','mara','Business',5,842,'You discover your business partner has been quietly taking money. What do you do?',[412,903,288,147]),
 ('s2','mara','Business',4,310,'They admit it, and ask for 30 days to pay it back. Do you agree?',[271,334,402]),
 ('s3','mara','Business',3,205,'Your records confirm it. Who do you tell first?',[520,233,189]),
 ('s4','mara','Business',2,121,'Dissolving means splitting the client list. Do you tell clients why?',[140,380]),
 ('s5','devon','Life Decisions',9,634,'A rival offers 40% more pay. Your team just started the project you pitched for two years. Do you leave?',[188,341,612,96]),
 ('s6','sana','Psychology',14,1210,'A close friend asks for honest feedback on their novel. It isn’t good. What do you say?',[302,1480,211]),
 ('s7','theo','Technology',20,978,'In 2030 your employer offers an AI twin that attends meetings in your place. Do you accept?',[264,889,402,731]),
 ('s8','priya','Relationships',30,455,'Your best friend’s partner told you something that would change how she sees him. Do you tell her?',[144,690,97]),
 ('s9','me','Life Decisions',50,266,'Would you move abroad for a year with no promise of coming back?',[320,415,128,204])]
SEED_CM = {'s1':2,'s2':1,'s5':1,'s6':1,'s7':1,'s8':1,'s9':2}
SIT = {
 'Business':['Your best employee asks for a raise you can’t afford.','A competitor offers to buy your startup at half its worth.','Your biggest client demands a discount or walks.','An investor wants a board seat for a small cheque.','You find a bug that has been overcharging customers.','Your co-founder wants to pivot the whole product.'],
 'Relationships':['Your friend keeps cancelling plans at the last minute.','You see your sibling’s partner on a dating app.','Your oldest friend stops replying after your promotion.','Your partner wants to move in after four months.','A friend asks you to be their emergency contact.','Your parents want you to move back home.'],
 'Life Decisions':['You get into grad school the same week you get a dream job.','Your landlord offers to sell you the flat below market.','You can retire early with half the pension.','You’re offered a role in a city you’ve never visited.','A cheap house needs a year of repairs.','You want to switch careers at 38.'],
 'Technology':['Your phone offers to read and answer your messages.','A neighbour’s camera points at your garden.','Your employer wants to track keystrokes “for wellbeing”.','A self-driving taxi is cheaper but slower.','You find your old posts used to train a chatbot.','Your smart home starts guessing your mood.'],
 'Psychology':['A stranger confides something heavy on a train.','Your therapist suggests ending sessions.','You catch yourself lying about small things daily.','A colleague takes credit and seems unaware.','You can erase one memory for good.','You notice your friend’s jokes have turned bitter.'],
 'Entertainment':['Your favourite author’s new book is a big letdown.','A friend spoils the finale on purpose.','You’re offered a cameo in an indie film.','The sequel ruins the ending you loved.','You can watch only one genre for a year.','A streaming service deletes your favourite show.'],
 'Education':['Your teacher marked you down for a correct answer.','You can skip a year but lose your friends.','A classmate asks to copy your homework.','Your thesis supervisor disagrees with your method.','Tuition doubles in your final year.','You can learn one language in a month.'],
 'Hypotheticals':['A genie offers one wish with a hidden cost.','You wake up a week in the past.','Everyone can hear your thoughts for an hour.','You’re handed a button that pays $1M and cancels a stranger’s luck.','You can swap lives with anyone for a day.','The internet is gone for a month.'],
 'Personal Growth':['You promised to wake at 5am and failed again.','A mentor tells you your plan is too safe.','You get praise you feel you didn’t earn.','You’re invited to speak to 500 people.','You’re asked to forgive someone who never apologised.','You can quit one habit overnight.']}
ENDS = ['What do you do?','What would you choose?','Do you speak up?','How do you respond?']
posts = []
for pid, cr, cat, hrs, likes, title, ch in SEED:
    posts.append(dict(id=pid, title=title, creator=cr, category=cat, created=(dt.datetime(2026,11,15,12,0)-dt.timedelta(hours=hrs)).strftime('%Y-%m-%dT%H:%M'),
                      likes=likes, choices=ch, votes=sum(ch), comments=SEED_CM.get(pid, 0), seed=True))
nonpersona = [u for u in users if u['id'] not in [p[0] for p in PERSONAS] and u['archetype'] in ('power','regular')]
for cat in CATS:
    sits = SIT[cat][:]; random.shuffle(sits)
    for s in sits[:6] if cat != 'Personal Growth' else sits[:6]:
        n = random.choice([2,3,3,4]); base = [max(5, int(random.lognormvariate(5, .8))) for _ in range(n)]
        posts.append(dict(id=f'g{len(posts):03d}', title=f'{s} {random.choice(ENDS)}', creator=random.choice(nonpersona)['id'], category=cat,
                          created=(dt.datetime(2026,11,15,12,0)-dt.timedelta(hours=random.randint(60, 24*130))).strftime('%Y-%m-%dT%H:%M'),
                          likes=None, choices=base, votes=None, comments=None, seed=False))
random.shuffle(posts[9:]) if False else None
posts = posts[:9 + 51]
def distribute(total, weights, fixed):
    rem = max(0, total - sum(fixed)); sw = sum(weights) or 1
    raw = [rem * w / sw for w in weights]; fl = [int(x) for x in raw]
    left = rem - sum(fl)
    for i in sorted(range(len(raw)), key=lambda i: raw[i] - fl[i], reverse=True)[:left]: fl[i] += 1
    return fl
def sumu(k): return sum(u['_tot'][k] for u in users)
nonseed = [p for p in posts if not p['seed']]; seeds = [p for p in posts if p['seed']]
W = [random.lognormvariate(0, .9) * (1 + (dt.datetime(2026,11,15)-dt.datetime.strptime(p['created'],'%Y-%m-%dT%H:%M')).days / 60) for p in nonseed]
# seeded stories have app-defined votes/likes/comments; the rest of each platform total goes to other stories
seed_views = [int(p['votes'] / random.uniform(.38, .55)) for p in seeds]
for key, arr in (('votes', None), ('likes', None), ('comments', None)):
    pass
for k_user, k_post in (('votes','votes'),('likes','likes'),('comments','comments')):
    vals = distribute(sumu(k_user), W, [p[k_post] for p in seeds])
    for p, v in zip(nonseed, vals): p[k_post] = v
for p in nonseed:  # split votes across choices
    sw = sum(p['choices']); ch = [int(p['votes'] * c / sw) for c in p['choices']]; ch[0] += p['votes'] - sum(ch); p['choices'] = ch
for k_user, k_post in (('bookmarks','bookmarks'),('shares','shares'),('views','views')):
    fx = seed_views if k_post == 'views' else [int(p['likes'] * (.08 if k_post == 'bookmarks' else .04)) for p in seeds]
    vals = distribute(sumu(k_user), W, fx)
    for p, v in zip(seeds, fx): p[k_post] = v
    for p, v in zip(nonseed, vals): p[k_post] = v
for p in posts:
    p['views'] = max(p['views'], p['votes']); p['impressions'] = int(p['views'] / random.uniform(.22, .45))
    p['avg_dwell_sec'] = random.randint(18, 95); p['completion_rate'] = round(p['votes'] / max(1, p['views']), 3)
    p['continuations'] = poisson(p['votes'] * random.uniform(.004, .02)); p['reports'] = poisson(p['views'] / 4000)
    src = [random.random() + x for x in (1.4, .8, .5, .35, .3)]; ssum = sum(src)
    p['sources'] = dict(zip(['feed','explore','search','share','profile'], [round(x / ssum, 3) for x in src]))
    age = max(1, (dt.datetime(2026,11,15,12,0) - dt.datetime.strptime(p['created'], '%Y-%m-%dT%H:%M')).days + 1)
    p['daily_views'] = [int(p['views'] / max(14, age) * random.uniform(.4, 1.8) * (1.5 if i < 3 and age > 14 else 1)) for i in range(14)]
posts.sort(key=lambda p: p['created'], reverse=True)
# ---- finalize users
pc = {}
for p in posts: pc[p['creator']] = pc.get(p['creator'], 0) + 1
for u in users:
    t = u['_tot']; a = u['_act']; dm = u['_dm']; ad = sum(a)
    u['plan'] = 'free'; u['billing'] = None; u['mrr'] = 0; u['lifetime_revenue'] = 0.0; u['sub_start'] = None; u['sub_end'] = None; u['upgraded_on'] = None
    if u['_segs']:
        s0 = u['_segs'][0]; u['sub_start'] = str(D(s0[0])); last = u['_segs'][-1]
        u['billing'] = last[3]
        if last[1] is None: u['plan'] = last[2]; u['mrr'] = round(seg_price(last), 2)
        else: u['sub_end'] = str(D(last[1]))
        if len(u['_segs']) > 1: u['upgraded_on'] = str(D(u['_segs'][1][0]))
        u['lifetime_revenue'] = round(sum(seg_price(s) * ((s[1] if s[1] is not None else ND) - s[0]) / 30.4375 for s in u['_segs']), 2)
    last = u['_last']; since = ND - 1 - last
    u['last_active'] = str(D(last)); u['status'] = 'active' if since <= 7 else 'dormant' if since <= 30 else 'churned'
    u['sessions'] = t['sessions']; u['time_spent_min'] = round(t['minutes']); u['active_days'] = ad
    u['avg_session_min'] = round(t['minutes'] / max(1, t['sessions']), 1); u['story_views'] = t['views']
    u['votes'] = t['votes']; u['likes'] = t['likes']; u['comments'] = t['comments']; u['bookmarks'] = t['bookmarks']; u['shares'] = t['shares']
    u['follows'] = int(random.lognormvariate(2.4, .8)) + (3 if u['archetype'] != 'lurker' else 0)
    u['searches'] = poisson(t['sessions'] * (.35 if u['archetype'] in ('power','regular') else .15))
    u['stories_created'] = pc.get(u['id'], 0)
    u['branches_written'] = min(t['votes'] // 25, poisson(t['votes'] / 60))
    u['reports_filed'] = 1 if random.random() < .04 else 0
    u['interactions'] = t['votes'] + t['likes'] + t['comments'] + t['bookmarks'] + t['shares']
    u['engagement_score'] = min(100, round(math.log1p(u['interactions'] + t['minutes'] / 3) * 11.5))
    u['daily_min'] = [round(x, 1) for x in dm[-14:]]
    u['settings'] = dict(dark=random.random() < .38, push=random.random() < .64, email=random.random() < .55, private=random.random() < .09)
    mix = [random.random() ** 2 for _ in CATS]; top = sorted(zip(CATS, mix), key=lambda x: -x[1])[:3]; s3 = sum(m for _, m in top)
    u['top_categories'] = [dict(name=c, pct=round(100 * m / s3)) for c, m in top]
    ev = []
    for _ in range(6):
        ty = random.choice(['vote','vote','like','like','comment','bookmark','share','view'])
        d = random.randint(0, 13); ev.append(dict(day=str(AS_OF - dt.timedelta(days=d)), type=ty, story=random.choice(posts)['id']))
    ev.sort(key=lambda e: e['day'], reverse=True); u['recent'] = ev
# ---- daily + monthly series
posts_by_day = {}
for p in posts: posts_by_day[p['created'][:10]] = posts_by_day.get(p['created'][:10], 0) + 1
def uactive(u, a, b):  # any activity in [a,b]
    return any(u['_act'][max(0, a):b + 1])
sponsored_month = {}
months = []
y, m = 2025, 12
while (y, m) <= (2026, 11):
    months.append((y, m)); m += 1
    if m == 13: y, m = y + 1, 1
msp = lambda i: 0 if i < 3 else int(26 * (i - 2) ** 1.35 * random.uniform(.9, 1.15))
for i, ym in enumerate(months): sponsored_month[ym] = msp(i)
def rev_day(d):  # subscription revenue for a day
    return sum(seg_price(s) / 30.4375 for u in users for s in u['_segs'] if s[0] <= d and (s[1] is None or d < s[1]))
daily = []
for d in range(ND - 180, ND):
    wau = sum(1 for u in users if uactive(u, d - 6, d)); mau = sum(1 for u in users if uactive(u, d - 29, d))
    a = agg[d]; ym = (D(d).year, D(d).month)
    daily.append(dict(date=str(D(d)), dau=sum(1 for u in users if u['_act'][d]), wau=wau, mau=mau, new_users=sum(1 for u in users if u['_j'] == d),
        sessions=a['sessions'], minutes=round(a['minutes']), votes=a['votes'], likes=a['likes'], comments=a['comments'], bookmarks=a['bookmarks'],
        shares=a['shares'], stories=posts_by_day.get(str(D(d)), 0), revenue=round(rev_day(d) + sponsored_month[ym] / 30.4, 2)))
monthly = []; prev_mrr = 0; prev_paying = 0
for i, (y, m) in enumerate(months):
    first = (dt.date(y, m, 1) - LAUNCH).days; nxt = (dt.date(y + (m == 12), (m % 12) + 1, 1) - LAUNCH).days
    last = min(nxt - 1, ND - 1); end_mrr = sum(mrr_at(u, last) for u in users); paying = sum(1 for u in users if mrr_at(u, last) > 0)
    new_mrr = sum(seg_price(u['_segs'][0]) for u in users if u['_segs'] and first <= u['_segs'][0][0] <= last)
    churn = [u for u in users if u['_segs'] and u['_segs'][-1][1] is not None and first <= u['_segs'][-1][1] <= last]
    exp = sum(seg_price(u['_segs'][1]) - seg_price(u['_segs'][0]) for u in users if len(u['_segs']) > 1 and first <= u['_segs'][1][0] <= last)
    sub_rev = sum(seg_price(s) * max(0, min(s[1] if s[1] is not None else ND, last + 1) - max(s[0], first)) / 30.4375 for u in users for s in u['_segs'])
    monthly.append(dict(month=f'{y}-{m:02d}', users_total=sum(1 for u in users if u['_j'] <= last), new_users=sum(1 for u in users if first <= u['_j'] <= last),
        mau=sum(1 for u in users if uactive(u, last - 29, last)), mrr=round(end_mrr, 2), new_mrr=round(new_mrr, 2), expansion_mrr=round(exp, 2),
        churned_mrr=round(sum(seg_price(u['_segs'][-1]) for u in churn), 2), paying=paying, churned_users=len(churn),
        subscription_revenue=round(sub_rev, 2), sponsored_revenue=sponsored_month[(y, m)], revenue=round(sub_rev + sponsored_month[(y, m)], 2)))
# transactions
paid_users = [u for u in users if u['_segs']]; tx = []
for i in range(30):
    u = random.choice(paid_users); sg = u['_segs'][-1]
    amt = {('plus','monthly'):6,('plus','annual'):60,('creator','monthly'):14,('creator','annual'):140}[(sg[2], sg[3])]
    tx.append(dict(id=f'inv_{9000 + i}', user=u['id'], name=u['name'], plan=sg[2], billing=sg[3], amount=amt, date=str(AS_OF - dt.timedelta(days=random.randint(0, 20))),
                   status=wchoice([('paid',92),('failed',5),('refunded',3)])))
tx.sort(key=lambda t: t['date'], reverse=True)
# metrics
hour = [0.0] * 24
for c, mu, sd in ((8, 1.6, 1), (13, 1.5, 1.1), (21, 2.6, 1.3), (17, 1, 1.6)):
    for h in range(24): hour[h] += mu * math.exp(-min(abs(h - c), 24 - abs(h - c)) ** 2 / (2 * sd * sd))
hour = [h + .06 for h in hour]; hs = sum(hour); hour = [round(100 * h / hs, 2) for h in hour]
wk = [round(x, 1) for x in (13.8, 13.9, 14.1, 14.0, 13.9, 15.1, 15.2)]
cohorts = []
for w in range(10, 0, -1):
    s = ND - 7 * w; us = [u for u in users if s <= u['_j'] < s + 7]; row = []
    for n in range(10):
        a, b = s + 7 * n, s + 7 * n + 6
        row.append(None if b > ND - 1 + 6 or not us else round(100 * sum(1 for u in us if uactive(u, a, min(b, ND - 1))) / len(us)))
    cohorts.append(dict(week_start=str(D(s)), size=len(us), retention=row))
terms = [('boundaries',212),('quit my job',188),('ai twin',164),('moving abroad',151),('honest feedback',139),('cofounder',126),('therapy',118),('breakup',97),('promotion',92),('remote work',81),('friend betrayal',74),('startup equity',63)]
reasons = ['Spam','Harassment','Misleading','Off-topic','Sensitive content']
reports = [dict(id=f'rp_{100+i}', story=random.choice(posts)['id'], reason=random.choice(reasons), reported=str(AS_OF - dt.timedelta(days=random.randint(0, 12))), status=wchoice([('open',45),('resolved',45),('dismissed',10)])) for i in range(14)]
metrics = dict(hourly_share_pct=hour, weekday_avg_minutes=wk, cohorts=cohorts, search_terms=[dict(term=t, count=c) for t, c in terms],
               marketing_spend_30d=dict(paid_social=260, search_ads=140, creator_partnerships=120), reports=reports,
               notes='hourly_share_pct is share of sessions by local hour (index 0 = 00:00). weekday_avg_minutes starts Monday.')
meta = dict(as_of=str(AS_OF), launch_date=str(LAUNCH), currency='USD', data_kind='synthetic-demo', generated_by='tools/generate_data.py',
            plans=dict(plus=dict(monthly=6, annual=60), creator=dict(monthly=14, annual=140)))
admin = dict(session_hours=8, max_failed_attempts=5, lockout_minutes=2,
             admins=[dict(username='alexadmin', password='alexadminpass', display_name='Alex (Admin)', role='Super admin')])
for u in users:
    for k in [k for k in u if k.startswith('_')]: del u[k]
    del u['archetype']
def w(name, obj, pretty=False):
    with open(os.path.join(OUT, name), 'w') as f:
        if name == 'users.json' or name == 'posts.json': f.write('[\n' + ',\n'.join(json.dumps(x, ensure_ascii=False) for x in obj) + '\n]\n')
        else: json.dump(obj, f, indent=2 if pretty else None, ensure_ascii=False)
os.makedirs(OUT, exist_ok=True)
w('admin.json', admin, True); w('meta.json', meta, True); w('users.json', users); w('posts.json', posts)
w('daily.json', daily); w('monthly.json', monthly); w('transactions.json', tx); w('metrics.json', metrics)
bundle = dict(admin=admin, meta=meta, users=users, posts=posts, daily=daily, monthly=monthly, transactions=tx, metrics=metrics)
with open(os.path.join(OUT, 'bundle.js'), 'w') as f:
    f.write('/* Auto-generated by tools/generate_data.py - mirrors data/*.json so the dashboard also works when index.html is opened straight from disk (file://). */\nwindow.BL_DATA=' + json.dumps(bundle, ensure_ascii=False) + ';\n')
print('users', len(users), 'posts', len(posts), 'last mrr', monthly[-1]['mrr'], 'paying', monthly[-1]['paying'], 'sum user mrr', round(sum(u['mrr'] for u in users), 2))
