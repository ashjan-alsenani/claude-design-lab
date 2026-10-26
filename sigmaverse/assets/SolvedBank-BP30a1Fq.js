import{a as B,j as e,u as ne,A as re,m as W}from"./visuals-9Lh07I0y.js";import{r as h,bB as Te,h as Y,ag as le,ba as Q,e as G,l as Se,aB as ae,ah as Ce,a6 as de,k as he,aV as oe,aa as Ae,ai as Pe,V as _e,b as Ie,j as se}from"./icons-Cy7jDa71.js";import{_ as a,s as Me,f as ce,P as me,l as Re,e as ie}from"./index-C8-rj5ng.js";import{M as S,a as qe}from"./MinitabFigure-DcPLlLKO.js";import"./Markdown-qLsiuUNw.js";const Oe=[{topic:"3.1.1",title:"Multi-Vari Analysis",pages:"Book pp. 240–254",doc:"book-201-300",pdfPage:43,intro:"A multi-vari study is a picture of variation. It plots one continuous output (Y) against several categorical sources of variation and shows which **family of variation** is the biggest. It is the first X-sifting tool of Analyze: it tells the team where to look, and also where *not* to look.",sections:[{heading:"What a multi-vari study is",body:`The book defines a multi-vari study as a tool that **graphically displays patterns of variation**. It helps to find possible X's or *families* of variation that hide **within a subgroup, between subgroups or over time**.

Key rules from the book:

- The **output must be continuous** (wall thickness, call time, fill volume). The **sources of variation must be discrete** categories (cavity 1–4, die cycle 1–3, Monday/Wednesday/Friday).
- At this point in DMAIC it is a **passive study**: you watch the process as it runs and do not change any factor. Later, the same chart can show data from an experiment where factors were changed on purpose.
- In Minitab the data must be **balanced**: every source of variation must have the same number of data points.

The chart can also show capability, stability, two-way interactions and the effect of shifts, machines, materials or noise factors on Y. It illustrates analysis-of-variance data in a graph.`},{heading:"The three families of variation",body:`The book calls within-unit, between-unit and temporal variation the **classic causes of variation**.

| Family | Also called | Examples from the book |
|---|---|---|
| **Within unit** | Positional | Variation across one part's geometry; many chips on one wafer; position in a plating batch |
| **Between unit** | Cyclical | Consecutive pieces; groups of pieces; consecutive batches |
| **Temporal** | Over time | Shift-to-shift, day-to-day, week-to-week |

A "unit" can be one piece or a group of pieces made at the same moment. In the book's **injection-moulding** example each die cycle makes **4 widgets**, so one unit = 4 widgets.

- **Within-unit:** compare the 4 widgets from one die cycle.
- **Between-unit:** compare the *averages* of consecutive die cycles.
- **Temporal:** compare the averages of whole time periods (for example the 8 o'clock hour with the 10 o'clock hour, or Monday with Friday).`},{heading:"The five-step method and a balanced sampling plan",body:`The book's method has five steps:

1. Create a sampling plan (it must cover **within, between and temporal** variation).
2. Gather passive data.
3. Graph the data.
4. Check whether the variation is exposed.
5. Interpret the results.

At step 4, if you see only minor variation, go back and collect more data. The book's guideline: your data should show **at least 80% of the usual process variation** before you trust the graph.

**Balanced plan.** The moulding plan is 3 time periods × 3 die cycles per period × 4 widgets per cycle:

$$3 \\times 3 \\times 4 = 36 \\text{ rows of data}$$

Label the units **generically** (1–3 inside each period), not 1–9. If you number them 1–9, Minitab sees an unbalanced design, shows an error and cannot draw the chart.

Before graphing, list the potential X's from the Measure-phase **X-Y Matrix** and assign each X to a family. If an X belongs to more than one family, split it with percentages.`},{heading:"Reading the chart: worked example",body:`The book reads the injection-moulding chart like this:

- **Within unit:** the widest spread inside one die cycle (unit 1, period 2) is about **0.07**.
- **Between unit:** the die-cycle averages inside one period differ by about **0.18**.
- **Temporal:** the period averages differ by about **0.06**.

The **largest family is between-unit** (die cycle to die cycle). "Something is changing" from cycle to cycle, so the team focuses on X's that act on each cycle (injection pressure, die temperature, release, and so on).

**Is the sample big enough?** The total spread in the chart is 0.22 units. The usual process spread is 0.25 units:

$$\\dfrac{0.22}{0.25} = 0.88 = 88\\%$$

88% is above the 80% guideline, so the sampling plan captured the problem.

Next steps from the book: confirm the family with the right **hypothesis test**, focus on the X's of the largest family, and collect more data or move to experimentation. Remember the goal is to learn what the cause **is and what it is not**.`},{heading:"Factor order, transactional data and the bottle-fill case",body:`**Factor order matters.** The same data look different depending on the order in which you enter the factors. The classical order is **within, between, temporal**, but the book says to use the graph that shows the variation most clearly.

**Transactional processes.** In the call-centre example (Y = call time; X = centre, time of day, method) the largest source is harder to see, because incoming calls are not controlled and one outlier can mislead you. Show the **individual data points** (Options) to spot very long or short calls. The book's advice: do not force-fit a tool; transactional data may need hypothesis tests instead.

**Bottle-fill exercise.** Fill volume was normal (AD p = 0.212) but wide, with mean 514.7 ml against an upper limit of 500 ml (Cpk −0.96). The multi-vari chart showed **within-unit variation largest**, temporal next and between-unit last. The real cause was the in-line scale: air flow in the room made the weights fluctuate. Lesson: **reduce variation first, then shift the mean.**`}],keyPoints:["Multi-vari = graphical, passive screening tool for patterns of variation.","Y must be continuous; the sources of variation must be discrete (categorical).","Three classic families: within-unit (positional), between-unit (cyclical), temporal (over time).","Minitab needs balanced data: equal data points for every condition (e.g. 3 × 3 × 4 = 36 rows).","Collect enough data to show at least 80% of the usual process variation.","Focus further work on the X’s of the largest family; confirm it with a hypothesis test.","The look of the chart depends on factor order; the classic order is within, between, temporal."],examTips:['Know which family an example belongs to: "4 cavities of one shot" = within; "shot to shot" = between; "Monday vs Friday" = temporal.',"A distractor says multi-vari is an experiment where factors are changed: in Analyze it is passive.","A distractor says Y can be attribute (pass/fail): the book requires a continuous output.","Multi-vari only points to a family; it does not prove root cause — a statistical test must follow."]},{topic:"3.1.2",title:"Classes of Distributions",pages:"Book pp. 255–264 (and p. 370)",doc:"book-201-300",pdfPage:58,intro:"Data have a shape, and the shape is a clue. The book first reviews the normal distribution and then sorts non-normal data into **four classes: skewness, kurtosis, multiple modes and granularity**. Each class has typical causes, so reading the shape helps you screen X's before any hypothesis test.",sections:[{heading:"The normal (Gaussian) distribution",body:`The book calls the normal curve the most important distribution in statistics. Its features:

- The total area under the curve is **1**.
- It is **mounded and symmetric** and extends forever in both directions, getting close to the axis but never touching it.
- **Mean = median = mode**, and the mean splits the area 50/50.
- The **standard normal (Z)** distribution has mean 0 and standard deviation 1.
- A process shows a normal shape when it has only **pure random variation** ("white noise").

Two cautions from the book. First, the normal curve drawn over a histogram is **not** your data: it is a theoretical curve built from your sample's mean and standard deviation. Second, data that look normal can still be improved: you can reduce the variation and create a new, narrower normal distribution.

Many hypothesis tests **assume normality**. If the assumption fails, those tests cannot be used to infer anything about the future, which is why every test on the roadmap starts with a normality check.`},{heading:"Class 1 — Skewness",body:`A distribution that is not symmetric is **skewed**. The **longest tail points in the direction of the skew**: a long tail to the right is right (positive) skew.

The book's six causes of skewness:

1. Natural limits (time cannot be below zero)
2. Artificial limits / sorting (only in-spec parts reported)
3. **Mixtures** — data from sources that should be the same but are not (machine A and B, operator A and B, payment method, interviewer)
4. Non-linear relationships (a normal X gives a non-normal Y)
5. Interactions (two inputs together have a bigger effect than each alone — the aerosol-spray-plus-flame example)
6. Non-random patterns across time (tool wear, chemical bath depletion, warm-up)

**Measuring it:** the skewness coefficient (Descriptive Statistics or Graphical Summary) is about **0 for symmetric data, positive for right skew, negative for left skew**. The book's right-skewed example has mean 70.0, median 65.7 and skewness +2.42 — the mean is pulled toward the long tail. Skewness is a **natural state** for data that run near a natural or artificial limit.`},{heading:"Class 2 — Kurtosis",body:`Kurtosis describes the **peak and the tails**.

| Type | Shape | Kurtosis value | Typical cause |
|---|---|---|---|
| **Leptokurtic** | Peaked, long tails | Positive (book example +3.08) | Distributions with **very different variances** laid on top of each other |
| **Platykurtic** | Flat, short tails | Negative (book example −0.99) | **Several means shifting over time** make a plateau |

The book lists the same four causes for both types:

- **2-1 Mixtures** — multiple set-ups, batches, machines, tool wear
- **2-2 Sorting or selecting** — scrapping product outside the spec limits
- **2-3 Trends or patterns** — lack of independence (tool wear, chemical bath)
- **2-4 Non-linear relationships** — for example chemical systems

Memory hook: *lepto* = "leaping" up (tall and thin peak); *platy* = flat like a plate. A flat (platykurtic) shape often means the process mean moved during data collection — a mixture you should separate and fix.`},{heading:"Class 3 — Multiple modes and outliers",body:`Multiple modes appear when the underlying sources are so different that the data show **separate peaks**. The book's reasons:

- **3-1 Mixtures of distributions** (most likely)
- **3-2 Lack of independence** — trends or patterns
- **3-3 Catastrophic failures** — for example a motor shorts out and the test reads zero

A **bimodal** distribution is often two normal distributions combined: 2 machines, 2 operators or 2 administrators. Each peak is normal, but the whole data set is not. The book says to "celebrate": these causes are usually the **easiest to find**, because you only need to ask what separates the two groups.

**Outliers.** One extreme outlier usually has **its own cause**; you can isolate it by looking at where it sits on the histogram's X axis. **Multiple outliers** are harder: they usually mean **several inputs** are involved.

In the book's bimodal example the mean (79.6) and median (83.8) differ, the standard deviation is large (32.4) and the Anderson-Darling p-value is below 0.005.`},{heading:"Class 4 — Granularity",body:`Granular data contain only a few distinct values, so the data look like **steps**. They are easy to see on a **dot plot**.

The book warns: granular data can **look normal** because they are symmetric, but they are **not continuous**. The normality test shows it: the p-value is well **below 0.05**, because there is not enough resolution in the data.

Two causes:

- **4-1 Measurement system resolution** — the gauge cannot see small differences (check the Gage R&R and the number of distinct categories).
- **4-2 Categorical (step-type) data** — the characteristic itself only takes a few values.

Fix: improve the measurement resolution or record more decimal places, then test again. Do not run a parametric test on badly granular data and trust the answer.`},{heading:"What to do with non-normal data",body:`The book's conclusion: **non-normal distributions are not bad**. They often carry **more root-cause information** than normal data, because the shape tells you *why*.

Practical rules from the book (pp. 264 and 370):

- **Skewness** is often natural (limits). The other three classes — kurtosis, multiple modes, granularity — are usually **symptoms of a problem** that should be identified, separated and corrected.
- With **every statistical test, check normality first**. Use the Anderson-Darling test: $H_0$: data are normal; $H_a$: data are not normal. If **p > 0.05**, you fail to reject normality and treat the data as normal.
- Do not rush to **transform** data. Ask a Master Black Belt; often data are "beaten into submission" while the real cause of non-normality is ignored.
- If you expect normal data but get non-normal data, look for the underlying cause; removing it often lets the data show their true normal shape.

Later in Analyze, non-normal continuous data lead to **median tests** (sign, Wilcoxon, Mann-Whitney, Kruskal-Wallis, Mood's median).`}],keyPoints:["Four classes of non-normality: skewness, kurtosis, multiple modes, granularity.","The longest tail points in the direction of the skew; skewness coefficient > 0 = right skew.","Leptokurtic = peaked with long tails (positive kurtosis); platykurtic = flat with short tails (negative).","Mixtures are the most likely cause of multiple modes; a bimodal set is often two normal sets combined.","Granular data look symmetric but fail the normality test because of poor resolution.","Normal curve: area 1, symmetric, mean = median = mode; Z has mean 0 and SD 1.","Non-normal data are not bad — they give root-cause clues; check normality before every test."],examTips:['Questions often describe a cause ("two machines feeding one line") and ask for the shape (bimodal / mixture).',"Swap trap: leptokurtic and platykurtic are often reversed in distractors — lepto = tall peak, long tails.",'For Anderson-Darling, p > 0.05 means "fail to reject normality", not "proved normal".',"Skewness is the only class the book calls a natural state; the other three usually signal a problem."]},{topic:"3.2.1",title:"Understanding Inference",pages:"Book pp. 267–279",doc:"book-201-300",pdfPage:70,intro:"Inferential statistics lets us draw conclusions about a whole population from a sample, while accounting for chance. Six Sigma moves from only *describing* data to *inferring* what the process will do. Every inference carries some risk, and this topic explains where that risk comes from and how big it is.",sections:[{heading:"From descriptive to inferential statistics",body:`**Descriptive statistics** summarise the data you have (mean, median, standard deviation, histogram). **Inferential statistics** model the data in a way that **accounts for randomness and uncertainty**, so you can draw conclusions about the process or population.

The book defines *inference* as reasoning from facts or evidence to a logical conclusion. In a project, the "mission" — cut cycle time, reduce errors, raise service level — translates statistically into two goals:

- **move the process mean**, and/or
- **reduce the process standard deviation**.

You make these decisions from **sample data, not population data**, so you are always taking a risk. The question inference answers is: *did the output really change, or is this just an unlikely sample?* The Central Limit Theorem (3.2.3) and hypothesis testing (3.3) are the tools that put a number on that risk.`},{heading:"Population, sample, observation — parameters and statistics",body:`The book's definitions:

- **Population** — every data point that has ever been or will ever be generated from a characteristic.
- **Sample** — a portion (subset) of the population, taken at one time or over time.
- **Observation** — one individual measurement.

Numbers that describe a population are **parameters**; numbers that describe a sample are **statistics**. A statistic is an **estimate** of the matching parameter.

| Measure | Population parameter | Sample statistic |
|---|---|---|
| Mean | $\\mu$ | $\\bar{x}$ |
| Standard deviation | $\\sigma$ | $s$ |
| Variance | $\\sigma^2$ | $s^2$ |
| Proportion | $P$ | $p$ |
| Size | $N$ | $n$ |

The sample standard deviation uses **n − 1** in the denominator (exam convention):

$$s = \\sqrt{\\dfrac{\\sum (x_i - \\bar{x})^2}{n-1}}$$

The book's summary: all statistics based on samples are estimates, and **all estimates could be wrong**.`},{heading:"The five-step approach and the four types of error",body:`The book gives a **5-step approach to inferential statistics**:

1. What do you want to know?
2. What tool will give you that information?
3. What kind of data does that tool require?
4. How will you collect the data?
5. How confident are you with your data summaries?

Four **types of error** add uncertainty to any inference:

1. **Error in sampling** — random differences between samples ("luck of the draw"). This is the **only error statistics can accommodate**.
2. **Bias in sampling** — lack of independence, or a systematic sampling procedure (measuring the height of horse jockeys only to estimate everyone's height).
3. **Error in measurement** — the measurement system adds error (checked with MSA / Gage R&R).
4. **Lack of measurement validity** — the measurement does not measure what it should (a probe in the wrong slot; a thermometer placed next to a furnace).

Only the first one shrinks when you take a bigger sample. Bias and invalid measurements stay, however large n is.`},{heading:"Sampling error in action: the die example",body:`The book builds a population of **1,000 die rolls** (mean 3.551, SD 1.669) and draws samples from it in Minitab (*Calc > Random Data > Sample from Columns*).

| Sample size | 5 samples drawn | Range of the 5 means | Range of the 5 SDs |
|---|---|---|---|
| n = 5 | means 3.4 to 4.6 | 1.2 | 0.591 |
| n = 10 | means 3.2 to 4.1 | 0.9 | 0.668 |
| n = 30 | means 3.17 to 3.80 | 0.63 | 0.381 |

Each sample gives a **different mean** — that is sampling error. As n grows, the sample means crowd closer to the population mean, so **sampling error gets smaller**.

**Book wording to handle carefully.** The book says that when the sample size increases "the values of the mean and standard deviation decrease". That is misleading. The *values* do not fall; the **spread of the estimates from sample to sample falls**. Use this meaning on the exam.

The book adds: **every statistic has a sampling distribution** — means, medians, standard deviations — if you keep drawing samples.`},{heading:"Standard error and an interval estimate: worked example",body:`The standard deviation of the distribution of sample means is the **standard error of the mean (SE)**:

$$SE = \\dfrac{s}{\\sqrt{n}}$$

About **95% of sample means fall within ±2 standard errors** of the true mean, so a sample mean ± 2 SE gives a rough 95% interval for $\\mu$.

**Book example — casting set-up time.** A sample of n = 20 set-ups has mean 45 min and s = 10 min.

$$SE = \\dfrac{10}{\\sqrt{20}} = \\dfrac{10}{4.472} = 2.24 \\text{ min}$$

$$45 \\pm 2 \\times 2.24 = 45 \\pm 4.47 \\;\\Rightarrow\\; 40.5 \\text{ to } 49.5 \\text{ min}$$

So the true average is very likely between 40.5 and 49.5 minutes. If a process change cuts the sample average by **only 2 minutes**, do not celebrate: a 2-minute change lies inside the normal sampling noise. This is why the book says to look beyond a single **point estimate** to the interval around it.

The SE falls quickly at first and then flattens near **n = 30**, which is also where the t and Z distributions become nearly the same.`}],keyPoints:["Inferential statistics = conclusions about a population from a sample, allowing for randomness.","Parameters (μ, σ, P, N) describe populations; statistics (x̄, s, p, n) describe samples and estimate them.","Four error types: sampling error, sampling bias, measurement error, lack of measurement validity.","Only sampling error can be handled by statistics and reduced with a bigger sample.","SE of the mean = s ÷ √n; about 95% of sample means lie within ±2 SE of μ.","Bigger samples shrink the spread of estimates, not the values of the mean or SD.","Sample SD uses n − 1."],examTips:['Matching items: "probe in the wrong slot" = lack of validity; "jockeys only" = bias; "luck of the draw" = sampling error.',"Trap: a bigger sample does not remove bias; only random sampling error shrinks with n.","Be ready to compute SE and a ±2 SE interval (e.g. 45 ± 2 × 10 ÷ √20 → 40.5 to 49.5).",'Know the five-step approach starts with "What do you want to know?"']},{topic:"3.2.2",title:"Sampling Techniques & Uses",pages:"Book pp. 141, 268–274, 291–292 (named sampling schemes: syllabus + academy lesson)",doc:"book-101-200",pdfPage:44,intro:"Sampling means studying part of a population to learn about the whole. A good sample is **representative** (free of bias) and **large enough** (small sampling error). The book covers the basic ideas and sample-size thinking; the named sampling schemes (random, stratified, systematic, cluster, subgroup) come from the syllabus and the academy lesson.",sections:[{heading:"Why we sample: population, frame and sample",body:`The book (Measure chapter, p. 141) defines:

- **Population** — all the items with the property of interest.
- **Frame** — an identifiable list of the population from which the sample is drawn. A good frame is **complete** and lists **every element once**.
- **Sample** — a much smaller subset used to make an inference.

The **purpose of sampling**: to get a sufficiently accurate inference for **much less time, money and effort**, and to give a basis for statistical inference. If the sampling is done well, what you see in the sample represents the population.

The frame matters. The book's example: a list of registered voters may be a poor frame for "the adult public"; a list of licensed drivers may be better. If the frame misses part of the population, the sample cannot represent it, however carefully you draw from the list.

Testing an entire population is usually impossible or too costly, so the book says we need **methods that make the sample a fair representation** of the population.`},{heading:"The main sampling schemes",body:`These schemes are not named in the book; they come from the syllabus and the academy lesson.

| Scheme | How it works | Use it when | Weakness |
|---|---|---|---|
| **Simple random** | Every unit has an equal chance | Default; the formulas assume it | May miss a small subgroup by chance |
| **Stratified** | Split into groups that *differ* (strata); sample randomly **within every** stratum | Regions, vendors or shifts behave differently | Needs stratum information |
| **Systematic** | Every k-th unit after a random start | Steady stream of transactions | Biased if the process has a cycle that matches k |
| **Cluster** | Choose a few natural groups at random; measure **all** units inside | Access or travel is costly | Units in a cluster are alike → less precise |
| **Rational subgroup** | Small groups (3–5) of consecutive units at regular intervals | Control charts, short-term capability | Never mix machines in one subgroup |

For systematic sampling the step is:

$$k = \\dfrac{N}{n}$$

Example: 400 of 12,000 bills → k = 30. Exam pair: **strata differ** (sample inside each); **clusters are alike** (take all units in a few).`},{heading:"Sampling error versus sampling bias",body:`The book separates two problems (p. 268):

- **Error in sampling** — random, "luck of the draw" differences between samples. It is the only error statistics can handle, and it **shrinks as n grows**. In the die example the range of five sample means fell from **1.2 (n = 5)** to **0.9 (n = 10)** to **0.63 (n = 30)**.
- **Bias in sampling** — a systematic error from lack of independence or a non-random procedure (the "horse jockeys only" example). Bias **does not shrink** with a bigger sample: a biased sample of 10,000 is just confidently wrong.

Common sources of bias: convenience samples, sampling only one shift, one vendor or one time of day, letting the process owner pick "good" examples, and only looking at closed items.

Prevention: draw from a complete frame using a **random** method (the book uses Minitab's *Calc > Random Data > Sample from Columns*), spread the sample across shifts and days, and let the process run normally while you sample.`},{heading:"How many samples? It depends on delta and sigma",body:`The book's answer to "how many samples?" is: **it depends on the size of the difference (delta) and the standard deviation**. Small differences and large variation need large samples. "Should we take more samples just to be sure? No — not if you took the correct number the first time."

**To estimate a mean within ±E** (academy lesson):

$$n = \\left( \\dfrac{z\\,\\sigma}{E} \\right)^2 \\quad \\text{(round up; } z = 1.96 \\text{ for 95\\%)}$$

**Worked example.** σ ≈ 12 min; estimate the mean within ±3 min at 95% (z = 1.96):

$$n = \\left( \\dfrac{1.96 \\times 12}{3} \\right)^2 = 7.84^2 = 61.5 \\;\\Rightarrow\\; 62$$

The book adds: if the data are **non-normal, multiply the calculated sample size by 1.1** (62 × 1.1 = 68.2 → 69).

**To estimate a proportion within ±E:**

$$n = \\dfrac{z^2\\, p(1-p)}{E^2}$$

With no idea of p, use p = 0.5: at 95% and ±5 points this gives 384.2 → **385**.`},{heading:"Sampling for different uses",body:`The right sample depends on what you want to know (book: "How should we conduct the sampling? It depends on what you want to know").

- **Hypothesis tests:** n depends on delta, σ, α and power. Use Minitab's *Power and Sample Size* (3.3.3). The book's "perfect sample size" is the minimum n that gives exactly **5% overlap** (risk) between the distributions you want to tell apart.
- **Capability (continuous data):** a minimum of **30** samples (book p. 397). Attribute data need **a lot** more.
- **Measurement system analysis:** parts are **not** a random sample — select them across the full range of the process, and measure them in random order (book p. 192).
- **Control charts:** rational subgroups of **3–5 consecutive units**, taken at a regular frequency, without mixing machines in one subgroup (book pp. 517–519).
- **Non-parametric tests:** divide the t-test sample size by **0.864** (book p. 378).

Whatever the use, the sample must be random within its purpose and large enough for the decision.`}],keyPoints:["Population = all items; frame = the list you sample from; sample = small subset used for inference.","Purpose of sampling: accurate enough inference for much less time, money and effort.","Stratified: sample within every stratum (strata differ). Cluster: all units of a few clusters (clusters alike).","Systematic: every k-th unit, k = N ÷ n, after a random start.","Sampling error shrinks with n; sampling bias does not.","Sample size depends on delta and standard deviation; ×1.1 for non-normal data.","Capability needs ≥ 30 continuous samples; attribute data need many more."],examTips:["Strata versus cluster is the classic trap: who is sampled inside each group, and are the groups alike or different?",'If a scenario samples "every 10th call" from a process with a 10-call cycle, the answer is systematic-sampling bias.',"Expect a sample-size calculation: square the bracket and always round up.","A bigger sample does not fix a biased frame or method."]},{topic:"3.2.3",title:"Central Limit Theorem",pages:"Book pp. 270–279",doc:"book-201-300",pdfPage:73,intro:"The Central Limit Theorem (CLT) says that **averages of samples behave normally**, even when the individual data do not. It is the reason we can use sample means, standard errors, confidence intervals and t-tests. The book calls it the basis for using sampling to estimate population parameters.",sections:[{heading:"A distribution of sample means",body:`Start with any population — normal, skewed, flat, anything. The book's thought experiment:

1. Take a sample of n individual values and calculate its mean.
2. Repeat this many times.
3. Plot all the sample means as a new distribution.

This new distribution is the **sampling distribution of the mean**. The CLT describes its shape, centre and spread.

The book states it simply: as the sample size becomes large, the distribution of sample means **forms a normal distribution no matter what the shape of the population** of individuals.

Why should a Green Belt care? Project decisions are made from sample data, so you need to know how far a sample mean can wander from the true mean by chance alone. The CLT answers that question and so tells you **the risk you are taking**.`},{heading:"The die simulation: three things happen",body:`The book simulates it in Minitab with a fair die. A single die roll is **flat (uniform)**: each face 1–6 is equally likely. Then it creates 1,000 averages of **5 rolls** and 1,000 averages of **10 rolls** (*Calc > Row Statistics*), and draws three histograms on the **same X scale and bins**.

As the sample size grows from 1 to 5 to 10, three things happen:

1. **The centre stays the same** — all three histograms centre near 3.5.
2. **The variation decreases** — averages of 10 are much tighter than single rolls.
3. **The shape becomes normal** — the flat shape turns into a bell.

The book's "good news": the mean of the sample-mean distribution **equals the population mean**. The "better news": you can **reduce your uncertainty** about the population mean by **increasing n**.`},{heading:"The theorem and its three numbers",body:`If all possible random samples of size n are taken from a population with mean $\\mu$ and standard deviation $\\sigma$, the distribution of sample means will:

- have a mean of $\\mu$,
- have a standard deviation (the **standard error**) of

$$\\sigma_{\\bar{x}} = \\dfrac{\\sigma}{\\sqrt{n}}$$

- be **normal** when the parent population is normal, and **approximately normal for n ≥ 30** when the parent is not normal. It improves with larger samples — the book's "**bigger is better**".

**Worked example (die population, σ = 1.669):**

$$n = 5:\\; \\dfrac{1.669}{\\sqrt{5}} = 0.746 \\qquad n = 30:\\; \\dfrac{1.669}{\\sqrt{30}} = 0.305$$

Because of the square root, **four times the sample size halves the standard error**: n = 30 to n = 120 cuts 0.305 to 0.152.`},{heading:"So what? 95% within two standard errors",body:`About 95% of a normal distribution lies within ±2 standard deviations of its mean. Since sample means are normal, the book concludes: **there is a 95% probability the sample mean is within 2 standard errors of the true population mean.**

This turns a single number into a range. In the book's casting example (n = 20, mean 45 min, s = 10):

$$45 \\pm 2 \\times \\dfrac{10}{\\sqrt{20}} = 45 \\pm 4.47 \\;\\Rightarrow\\; 40.5 \\text{ to } 49.5 \\text{ min}$$

A later 2-minute improvement is smaller than this sampling noise, so it may be only chance.

**Why n = 30?** The book shows the standard error curve against n: it drops steeply and then flattens, and its **rate of change is almost zero by about 30 samples**. That is why 30 is often recommended for summary statistics, and it is also where the **t and Z distributions become nearly equal** (t at 0.975 approaches Z = 1.96).`},{heading:"Where the CLT is used — and what it does not say",body:`**Uses in Lean Six Sigma:**

- **t-tests and confidence intervals** — the true mean lies within the distribution of sample means (the t-distribution), so t-tests can judge differences between means.
- **Standard error** in every Minitab output (SE Mean = $s$ divided by $\\sqrt{n}$).
- **Xbar charts** — subgroup averages are near-normal and more sensitive to shifts than single values.
- **Sample-size thinking** — larger n means narrower intervals and smaller detectable differences.

**What the CLT does not say:**

- It does **not** make the individual data normal. A skewed process stays skewed; only the *averages* become normal. Capability work on individuals still needs the right distribution.
- It does **not** remove **bias** or measurement error; it only describes random sampling error.
- "n ≥ 30" is a guide, not a law: very skewed populations need more; normal populations need none.`}],keyPoints:["Sample means become normal as n grows, whatever the shape of the population.","Mean of the sample means = μ; their SD (standard error) = σ ÷ √n.","Approximately normal for n ≥ 30 if the parent is non-normal; exactly normal if the parent is normal.","As n grows: centre stays the same, variation falls, shape becomes normal.","About 95% of sample means lie within ±2 standard errors of μ.","Quadrupling n halves the standard error.","The CLT is about averages; it does not make individual data normal or remove bias."],examTips:['The most common question: "what happens to the distribution of means as n increases?" — centre same, spread smaller, shape normal.','Trap: "the population becomes normal" or "individual values become normal" is wrong; only the means do.',"Be ready to compute σ ÷ √n and to say what happens to SE when n is multiplied by 4.","Remember n ≈ 30: SE curve flattens and t ≈ Z."]},{topic:"3.3.1",title:"General Concepts & Goals of Hypothesis Testing",pages:"Book pp. 282–294",doc:"book-201-300",pdfPage:85,intro:"A hypothesis test is a formal way to decide, from sample data, whether a difference is **real or just chance**. It turns a practical problem into a statistical one, gives an answer with a known risk, and then turns that answer back into a practical conclusion. It is the main tool of the Analyze phase.",sections:[{heading:"Why we test hypotheses",body:`The book links hypothesis testing to the Six Sigma goal: **improve process capability** by moving the mean (or proportion) and reducing the standard deviation.

Collecting population data is too expensive, impractical or impossible, so decisions use **sample data**. Sample data carry **uncertainty** about the true parameters. Hypothesis testing helps you make **fact-based decisions** about whether populations really differ or whether the difference is just normal sample variation.

The book's purpose statement: hypothesis testing **integrates the Voice of the Process with the Voice of the Business** to make data-based decisions.

Other points from the book:

- It can avoid costly experiments by using **existing data** ("local store costs versus mini-bar expenses"), and can point the direction for later experiments.
- Decisions rest on **beliefs** (past experience), **preferences** (current needs), **evidence** (statistical data) and **risk** (acceptable level of failure).
- Typical questions: Did my sample come from a population with mean 100? Is my sample variance different from the population's? Is it different from a target?`},{heading:"The null and the alternative hypothesis",body:`A **hypothesis** is a predetermined theory about variables or their relationships. Every test has two:

- **Null hypothesis $H_0$** — there is **no difference or relationship**. It is the **default assumption** of all statistical tests (for example $H_0: \\mu = 5$).
- **Alternative hypothesis $H_a$** — there **is** a difference or relationship ($H_a: \\mu \\ne 5$, or $<$, or $>$).

The test starts by assuming $H_0$ is true. So you can only **reject $H_0$** or **fail to reject $H_0$**. If you reject, the data support $H_a$.

Think of a court: $H_0$ is the defendant, presumed innocent. The book says "**the null hypothesis is on trial**." Not enough evidence means "not guilty", never "proved innocent".

**Tails:** "≠" is a **two-tailed** test (α split between both tails). "<" or ">" is a **one-tailed** test (all of α in one tail). The book notes this mainly changes which column you read in the t-table.`},{heading:"The six steps of a hypothesis test",body:`The book's six steps, used in every worked example:

1. **State the practical problem** (in business words).
2. **State the statistical problem** — write $H_0$ and $H_a$.
3. **Select the test and the risk levels** — usually **α = 0.05 and β = 0.10**.
4. **Establish the sample size** needed to detect the difference.
5. **State the statistical solution** — reject or fail to reject $H_0$.
6. **State the practical solution** — what it means for the business.

**Example (book p. 300).** Practical problem: a new supplier claims a hardness of 5. Statistical problem: $H_0: \\mu = 5$, $H_a: \\mu \\ne 5$. Test: 1-sample t, α = 0.05, β = 0.10. Sample: 9 parts. Statistical solution: p = 0.034 < 0.05, reject $H_0$. Practical solution: the supplier's claim is not correct.

Steps 1 and 6 are in business language; steps 2–5 are in statistical language. The test converts the practical problem into a statistical problem and back again.`},{heading:"p-value and alpha: the decision rule",body:`Any difference between the data and $H_0$ may be real or due to chance. The test calculates the **probability of seeing a difference this large by chance alone if $H_0$ were true** — the **p-value**.

**Alpha (α)** is the yardstick, chosen before the test. **Reject $H_0$ if p < α**; otherwise fail to reject.

| α | When the book uses it |
|---|---|
| 0.05 | Most common, typical in manufacturing |
| 0.10 | Transactional projects involving human behaviour |
| 0.01 | Rare — only when $H_0$ must be very hard to reject |

**Book dice example.** Is a die loaded toward "1"? Five rolls give five ones. If the die is fair:

$$P(\\text{five ones}) = \\left( \\dfrac{1}{6} \\right)^5 = 0.00013$$

That is about 1.3 chances in 10,000. Such a result is very unlikely under "fair die", so you reject $H_0$ and accept only a 0.013% chance of being wrong.`},{heading:"Writing the conclusion correctly",body:`The book's **common pitfalls** at the conclusion stage:

- The decision is about **$H_0$, not $H_a$**.
- The conclusion says whether the claim in $H_a$ was **upheld**.
- **Nothing has been proved** — it is just a decision, and every decision can be wrong (Type I or Type II error).

Standard wording:

- **Reject $H_0$:** "There **is** sufficient evidence at the α level of significance to show that [$H_a$]."
- **Fail to reject $H_0$:** "There is **not** sufficient evidence at the α level of significance to show that [$H_a$]."

**Exam convention versus book wording.** In several places the book says "accept the null hypothesis" (pp. 308, 390, 412) or "accept as chance differences". On the exam always write **"fail to reject $H_0$"**: lack of evidence is not proof that $H_0$ is true.

Finally, the book reminds you: **making a decision does not fix a problem — taking action does.**`},{heading:"Where hypothesis testing fits in Analyze",body:`The book's Analyze process map runs:

**Vital few X's identified → state practical theories → translate them into scientific hypotheses → select analysis tools → collect data → perform statistical tests → state the practical conclusion.**

Then three checks: **Statistically significant? Practically significant? Root cause?** Only an X that passes all three moves to Improve and Control; the FMEA is updated along the way.

The test family follows the data and the question (3.3.4): tests of **means** (t-tests, ANOVA), **variances** (F, Bartlett, Levene, chi-square), **medians** (sign, Wilcoxon, Mann-Whitney, Kruskal-Wallis, Mood's) and **proportions** (1- and 2-proportion, chi-square).

The Analyze roadmap step is to **prove or disprove the impact the X's have on the problem**. A hypothesis test also reveals hidden mixtures: data that look normal can be made of several distributions, and testing the X's separately shows it.`}],keyPoints:["H₀ = no difference (default, assumed true); Hₐ = there is a difference.",'You can only reject or fail to reject H₀ — never "accept" or "prove" it.',"Reject H₀ when p < α; α = 0.05 typical, 0.10 transactional, 0.01 rare.","Six steps: practical problem → statistical problem → test & risk → sample size → statistical solution → practical solution.","Book defaults: α = 0.05, β = 0.10.",'"≠" in Hₐ = two-tailed test; "<" or ">" = one-tailed.',"A decision proves nothing and can be wrong; action, not a decision, fixes the problem."],examTips:['Wrong options often say "accept H₀" or "H₀ is proved" — choose "fail to reject H₀".',"Know the order of the six steps; a common item asks which step comes right after stating the statistical problem.","The null always contains the equal sign; the claim you want to show usually goes in Hₐ.","p-value is the chance of data this extreme if H₀ is true — not the chance that H₀ is true."]},{topic:"3.3.2",title:"Significance; Practical vs. Statistical",pages:"Book pp. 269, 284–292",doc:"book-201-300",pdfPage:72,intro:"A difference can be **statistically significant** (probably not chance) without being **practically significant** (worth money or effort), and the reverse can also happen. The book calls failing to tie the two together one of the most common errors in statistics. Sample size is the link between them.",sections:[{heading:"Two kinds of significance",body:`The book's definitions (pp. 269, 285):

**Practical significance** — the amount of difference, change or improvement that has **practical, economic or technical value**; the improvement needed to **pay for the cost** of making it. Example: raising yield from **96% to 99%**.

**Statistical significance** — the size of difference needed to tell a **true difference** from one that **could have occurred by chance**; a change that probably (with a defined confidence) did not happen by chance. Examples: differences between suppliers, markets or servers.

The book's warning: "it is possible to realise a statistically significant difference **without** realising a practically significant difference."

In the Measure phase the team should agree what practical difference matters, and the **statistical difference tested must match it**. The difference can be in the **mean** or in the **variance**. Note that this needed delta is not always the full shift in the business case — ask how small a change would still be worth acting on.`},{heading:"Statistical significance: p-value against alpha",body:`A test calculates the **p-value**: the probability of getting a difference this large **by chance alone if $H_0$ were true**. Alpha is the yardstick.

- **p < α** → the difference is **statistically significant** → reject $H_0$.
- **p ≥ α** → not statistically significant → fail to reject $H_0$.

The book's quick rule (p. 287): p > 0.05 → no difference or relationship shown; p < 0.05 → there is a difference or relationship.

What the p-value does **not** tell you:

- It is **not** the probability that $H_0$ is true.
- It is **not** the size or importance of the difference. A tiny p can belong to a tiny, worthless difference measured on a huge sample.

So after every significant result, look at the **size** of the difference — the estimate and its confidence interval — and ask whether it matters. The book: "do a reality check."`},{heading:"Sample size decides what you can detect",body:`The book: "Our ability to detect a difference is **directly linked to sample size**", and "we can affect the outcome of a statistical test simply by changing the sample size."

**Book illustration (p. 290):** two means differ by δ = 5 with S = 1.

- With **n = 2**, the distributions of the means overlap by more than 5% → p > 0.05 → no significant difference.
- With **n = 30**, the overlap is below 5% → p < 0.05 → significant difference.

The real difference did not change; only the standard error did:

$$SE = \\dfrac{s}{\\sqrt{n}}$$

Minitab's *Power and Sample Size* (1-sample t, power 0.9, σ = 1) shows the **smallest difference you can detect**:

| n | 10 | 15 | 20 | 30 | 40 |
|---|---|---|---|---|---|
| Detectable difference (σ units) | 1.15 | 0.90 | 0.76 | 0.61 | 0.53 |

Consequences: a **very large n** can make a **trivial** difference "significant"; a **very small n** can miss an **important** one.`},{heading:"The delta-to-sigma ratio",body:`The book defines:

- **Delta (δ)** — the size of the difference between two means, or between one mean and a target.
- **Sigma (S)** — the sample standard deviation of the individual values.

Detection depends on their ratio:

$$\\text{effect size} = \\dfrac{\\delta}{S}$$

- **Large δ compared with S** → the difference is obvious; you hardly need statistics; a small sample is enough.
- **Large S** (noisy data) → differences are hard to establish; you need **larger samples** to reduce uncertainty.
- The **larger the delta, the smaller the sample** needed; the smaller the delta, the larger the sample.

**Worked example (book p. 299).** You need to detect a shift of 1.2 units and the process SD is 0.8:

$$\\dfrac{\\delta}{S} = \\dfrac{1.2}{0.8} = 1.5 \\text{ standard deviations}$$

In Minitab you can enter "difference 1.2, SD 0.8" or, equally, "difference 1.5, SD 1". Both ask for the same sample size. "How many samples?" — "It depends on your delta and standard deviation."`},{heading:"Putting both together: four outcomes",body:`| | **Practically significant** | **Not practically significant** |
|---|---|---|
| **Statistically significant** | Real and worth it → act | Real but too small to matter → do not spend money |
| **Not statistically significant** | Looks worth it but not proven → check power; collect more data | Nothing to act on |

**Examples from the book:**

- **Bonus exercise (p. 400):** accuracy target 80%; 1,680 of 2,000 shipments accurate = 84%. 0.80 is outside the confidence interval → statistically significant, and a 4-point gain is practically useful.
- **Boris and Igor (p. 404):** error rates 13.2% vs 17.3%, p = 0.084 → **not** statistically significant. The book's practical comment: the sample size was **not large enough** (1,673 per person needed). A difference that may matter, but is not proven.
- **Paired labs (p. 336):** mean difference 0.23 with a CI that includes 0 → fail to reject; the book notes more samples would narrow the interval.

Rule: decide the **practical** difference first, then size the sample so the **statistical** test can see it.`}],keyPoints:["Practical significance = a difference with economic or technical value (worth the cost).","Statistical significance = a difference unlikely to be due to chance (p < α).","Statistically significant does not mean practically important — always do a reality check.","Sample size directly controls the ability to detect a difference.","Larger delta → smaller sample needed; larger standard deviation → larger sample needed.","The practical difference you care about must match the statistical difference you test.","Failing to tie practical and statistical significance together is a very common error."],examTips:["Scenario with a huge sample and a tiny but significant difference → answer: statistically but not practically significant.","Scenario with a promising difference but p > α and a small sample → answer: insufficient power / sample too small.","Remember the book example of practical difference: yield 96% → 99%.","The p-value measures evidence against H₀, not the size of the effect."]},{topic:"3.3.3",title:"Risk; Alpha & Beta",pages:"Book pp. 287–292",doc:"book-201-300",pdfPage:90,intro:"Every hypothesis-test decision can be wrong in one of two ways. **Alpha (α)** is the risk of seeing a difference that is not there (Type I error); **beta (β)** is the risk of missing a difference that is there (Type II error). The book calls α, β and sample size n the **three focus points** of every decision.",sections:[{heading:"The decision table: two ways to be wrong",body:`| | **$H_0$ true** (no real difference) | **$H_0$ false** (real difference) |
|---|---|---|
| **Fail to reject $H_0$** | Correct decision | **Type II error (β)** |
| **Reject $H_0$** | **Type I error (α)** | Correct decision |

- **Type I error** — you **reject a true $H_0$**: you say "different" when nothing changed.
- **Type II error** — you **fail to reject a false $H_0$**: you say "same" when there really is a difference.

The book's formulas in words:

- α = probability of rejecting $H_0$ **when $H_0$ is true**.
- β = probability of failing to reject $H_0$ **when $H_0$ is false**.

**Power** is the probability of correctly rejecting a false $H_0$ — of finding a real difference:

$$\\text{Power} = 1 - \\beta$$

With the book's usual β = 0.10, the power is 0.90.`},{heading:"Alpha risk — the producer’s risk",body:`The book: the **alpha risk or Type I error**, generally called the **producer's risk**, is the probability of being wrong when you say something **is different**. It is "the risk of **implementing a change when you should not**."

Alpha is the **primary decision tool** of most tests: you set it in advance and compare the p-value with it. Typical values: **0.05** (most common), **0.10** (transactional, human behaviour), **0.01** (only when $H_0$ must be very hard to reject).

**Alpha on the reference distribution.** Alpha is shown as the shaded **tail area(s)** of a t, Z, χ² or F distribution — the "region of doubt". A result in the tail leads to rejection. In a two-tailed test α is **split in half**: with α = 0.05 each tail holds 0.025, and the Z critical values are ±1.96.

**Why is α usually smaller than β?** The book: we are more careful about wrongly **claiming** an X matters (and spending money on it) than about **overlooking** an X (a mistake that is never revealed).`},{heading:"Beta risk — the consumer’s risk — and power",body:`The book: the **beta risk or Type II error**, also called the **consumer's risk**, is the probability of being wrong when you say two or more things are **the same** when they are really different.

Another way to say it: beta is **failing to recognise an improvement**. The book's likely reasons: the **sample size was too small**, or the data were **imprecise or inaccurate** (a weak measurement system).

**Beta and sample size are closely related.** When Minitab calculates a sample size, you always enter the **power** of the test:

$$\\text{Power} = 1 - \\beta = 1 - 0.10 = 0.90$$

This sets a sample size that gives the right overlap between "distribution if $H_0$ is true" and "distribution if $H_a$ is true".

Memory hook: **α → Act wrongly** (a false alarm, producer's risk). **β → Blind** to a real change (a miss, consumer's risk).`},{heading:"What drives beta and power",body:`Four things set the power of a test:

| Change | Effect on β | Effect on power |
|---|---|---|
| Bigger sample size n | Smaller | **Higher** |
| Bigger difference to detect (δ) | Smaller | **Higher** |
| Smaller process SD (σ) | Smaller | **Higher** |
| Smaller α (e.g. 0.05 → 0.01) | **Bigger** | Lower |

The last row is the **α–β trade-off**: for a fixed n, making it harder to reject $H_0$ (smaller α) makes it easier to miss a real difference (bigger β). The only way to cut **both** risks is a **larger sample** (or less noisy data).

The book's n = 2 versus n = 30 picture (δ = 5, S = 1) shows this: with n = 2 the two distributions of means overlap so much that a real difference is missed; with n = 30 the standard error is small and the difference is detected.`},{heading:"Sample size with Minitab and multiple tests",body:`Minitab *Stat > Power and Sample Size*: there are four quantities — **sample size, difference, power, SD** (α is set in Options). **Fill in three, leave one blank**, and Minitab solves for it.

Book results (α = 0.05, power 0.9, σ = 1):

- **1-sample t, n = 9** → detectable difference **1.24** SD.
- **2-sample t, n = 40 and 50** → **0.734** SD, based on the **smaller** group. For the 2-sample t the sample size is **per group**.
- **One-way ANOVA, n = 5 per level** → **2.57** SD.

For non-parametric (median) tests the book's rule is:

$$n_{\\text{non-parametric}} = \\dfrac{n_{t\\text{-test}}}{0.864}$$

**Multiple tests inflate α.** Running many pairwise t-tests raises the overall Type I risk:

$$1 - (1 - \\alpha)^k = 1 - 0.95^7 = 0.30$$

With 7 pairs, the real α could be as high as **30%** — the reason to use ANOVA for three or more means.`}],keyPoints:["Type I error (α) = reject a true H₀; producer’s risk; implementing a change you should not.","Type II error (β) = fail to reject a false H₀; consumer’s risk; failing to see an improvement.","Power = 1 − β; book default β = 0.10 → power 0.90.","Book defaults α = 0.05 and β = 0.10; α is usually smaller than β.","Bigger n, bigger δ or smaller σ → more power; smaller α → less power.","Minitab sample size: fill three of size, difference, power, SD; it solves the fourth.","k pairwise tests inflate α to 1 − (1 − α)^k (7 pairs ≈ 30%)."],examTips:["Producer’s = α = Type I; consumer’s = β = Type II — distractors often swap them.",'A question that says "the team concluded no difference, but there was one" describes a Type II error.',"Know that α is set before the test and is compared with the p-value.","If asked how to reduce both α and β at once, the answer is a larger sample size."]},{topic:"3.3.4",title:"Types of Hypothesis Test",pages:"Book pp. 292–293, 340, 369–377, 396",doc:"book-201-300",pdfPage:95,intro:"There are many hypothesis tests, and choosing the right one is half the work. The book gives three **roadmaps**: continuous normal data, continuous non-normal data and attribute data. A few questions about the data and the goal lead you to exactly one test.",sections:[{heading:"Five questions that pick the test",body:`Ask these in order:

1. **What type of data is Y?** Continuous (time, weight) or attribute / count (pass–fail, defective or not).
2. **If continuous, is it normal?** Run Anderson-Darling first — the book says to check normality with **every** test. p > 0.05 → treat as normal.
3. **What do you want to compare?** A **mean**, a **median**, a **variance** or a **proportion**.
4. **How many groups?** One sample against a target, two groups, or three or more.
5. **Are the samples independent or paired / blocked?** The same unit measured twice (before–after) is paired.

The book's continuous roadmap order is always: **normality → test of equal variance → test of centre** (mean or median). Attribute data are non-normal by definition, so they have their own roadmap.`},{heading:"Continuous, normal data: means and variances",body:`| Question | Test | Hypotheses |
|---|---|---|
| One mean vs a target (σ unknown) | **1-sample t** | $H_0: \\mu = \\mu_0$ |
| Two independent means | **2-sample t** (pooled if variances equal; unpooled if not) | $H_0: \\mu_1 = \\mu_2$ |
| Before–after on the same units | **Paired t** (1-sample t on the differences) | $H_0: \\mu_\\delta = 0$ |
| Three or more means | **One-way ANOVA** | $H_0: \\mu_1 = \\mu_2 = \\mu_3 = \\dots$ |
| One variance vs a target | **1-sample variance** (chi-square) | $H_0: \\sigma^2 = \\sigma_0^2$ |
| Two variances | **F-test** | $H_0: \\sigma_1 = \\sigma_2$ |
| Three or more variances | **Bartlett's test** | $H_0: \\sigma_1 = \\sigma_2 = \\sigma_3$ |

The book: t-tests compare **one or two** means; for **more than two** means use ANOVA, because many t-tests inflate α. The equal-variance result decides whether the 2-sample t uses a pooled standard deviation.`},{heading:"Continuous, non-normal data: medians and Levene",body:`For skewed data the **median** describes the centre better than the mean. The book: if **just one** distribution is not normal, use a **non-parametric** test. Each has a normal-data counterpart:

| Question | Non-parametric test | Parametric counterpart |
|---|---|---|
| One median vs target | **1-sample sign** | 1-sample Z / t |
| One median vs target (symmetric data) | **1-sample Wilcoxon** | 1-sample Z / t |
| Two independent medians | **Mann-Whitney** | 2-sample t |
| Three or more medians | **Kruskal-Wallis** | One-way ANOVA |
| Three or more medians, outliers | **Mood's median** | One-way ANOVA |
| Medians in a blocked design | **Friedman** (syllabus) | Two-way ANOVA (no replication) |

Variance for non-normal data: **Levene's test** (two or more samples).

Variance-test summary from the book: **2 normal samples → F-test; > 2 normal → Bartlett; any non-normal → Levene.**`},{heading:"Attribute data: proportions and chi-square",body:`The book (p. 396): attribute data are **non-normal by definition**. Their roadmap:

| Situation | Test | Reading the result |
|---|---|---|
| One proportion vs a target | **1-proportion test** | $H_0: p = p_0$ |
| Two proportions | **2-proportion test** | p < 0.05 → the proportions differ |
| Two or more proportions | **Chi-square (contingency table)** | p < 0.05 → at least one proportion differs |
| Two categorical factors | **Chi-square (contingency table)** | p < 0.05 → the factors are **not independent** |

Minitab paths: *Stat > Basic Statistics > 1 Proportion / 2 Proportions*; *Stat > Tables > Chi-Square Test*.

Sample-size reminder from the book: attribute data need **a lot** of samples — far more than continuous data — and the smaller the difference to detect, the larger n must be.`},{heading:"Selecting the test: worked cases",body:`**Case 1.** Average handling time (continuous, AD p = 0.40) for two teams. → Normal, two independent groups → F-test for variances → **2-sample t**.

**Case 2.** The same 10 agents timed before and after training. → Paired data → **paired t** (or 1-sample t on the differences). The book shows a 2-sample t on paired shoe-sole data gives p = 0.716 instead of 0.009: the wrong test hides the effect.

**Case 3.** Recovery % at three plants, AD p < 0.05 at two plants, some outliers. → Non-normal, three groups → Levene for variance → **Kruskal-Wallis** (or **Mood's median** if outliers dominate).

**Case 4.** Defective / OK counts for three operators. → Attribute, three groups → **chi-square contingency table**.

**Case 5.** Is the standard deviation of fill weight still 0.31? Normal data, one sample → **1-sample variance**.

Pattern to remember: *data type → normality → what parameter → how many groups → paired or not*.`}],keyPoints:["Roadmap order for continuous data: normality → equal variance → test of centre.","Normal: 1-sample t, 2-sample t, paired t, one-way ANOVA; variances: 1-sample variance, F, Bartlett.","Non-normal: sign / Wilcoxon (1 sample), Mann-Whitney (2), Kruskal-Wallis / Mood’s median (3+), Levene for variance.","Attribute: 1-proportion, 2-proportion, chi-square contingency table.","F-test = 2 normal variances; Bartlett = 3+ normal; Levene = non-normal.","If even one group is non-normal, use a non-parametric test.","Paired data must be tested as differences, never with a 2-sample t."],examTips:['Most items are "which test?" scenarios — underline data type, normality, number of groups and pairing.',"Trap: Bartlett offered for non-normal data — the answer is Levene.","Trap: several t-tests offered for 3+ means — the answer is ANOVA (α inflation).","Know each non-parametric test’s parametric counterpart; it is a favourite matching question."]},{topic:"3.4.1",title:"1 & 2 sample t-tests",pages:"Book pp. 297–337",doc:"book-201-300",pdfPage:100,intro:"t-tests compare means when the population standard deviation is unknown. The book uses them three ways: **one mean against a target**, **two independent means**, and **paired data** (before and after on the same units). For more than two means you need ANOVA instead.",sections:[{heading:"When to use a t-test",body:`The book (p. 297) lists three uses:

- **Compare a mean with a target** — did the improved process reach its target? → **1-sample t**.
- **Compare the means of two different samples** — machine 1 vs machine 2, supplier 1 vs supplier 2 → **2-sample t**.
- **Compare paired data** — the same part before and after a process → **paired t**.

Conditions:

- Continuous, **normal** data (check each sample with Anderson-Darling first).
- Population σ **unknown** (estimated by s) — the usual case.
- For two samples, check **equal variances** first; it decides pooled versus unpooled.
- **Never** use repeated t-tests for more than two means: use **ANOVA**.

Decision rule for every t-test: p > 0.05 → fail to reject $H_0$; p < 0.05 → reject $H_0$. Equivalent CI rule: the mean is **not** significantly different from the target if the target lies **inside** the confidence interval.`},{heading:"The 1-sample t: formula and logic",body:`Hypotheses: $H_0: \\mu = \\mu_{\\text{target}}$ and $H_a: \\mu \\ne$ (or $<$, $>$) $\\mu_{\\text{target}}$.

The test statistic is "observed minus expected, over the standard error":

$$t = \\dfrac{\\bar{x} - \\mu_0}{\\dfrac{s}{\\sqrt{n}}} \\qquad df = n - 1$$

The confidence interval for the mean is:

$$\\bar{x} \\pm t_{\\text{crit}} \\times \\dfrac{s}{\\sqrt{n}}$$

Here $t_{\\text{crit}}$ comes from the t-table (two-sided, so the 0.975 column for α = 0.05) with n − 1 df. The interval is a 95% CI — roughly ±2 standard errors.

**Sample size.** With n = 2 the spread of sample means is so wide you cannot tell the sample from the target; with n = 30 you can. Minitab *Power and Sample Size > 1-Sample t*: with **n = 9** (power 0.9, SD 1) the smallest detectable difference is **1.24** standard deviations.

In Minitab: *Stat > Basic Statistics > 1-Sample t*. The default alternative is "not equal"; change it in **Options** for a one-sided test.`},{heading:"Worked example: the new supplier’s hardness",body:`**Practical problem (book pp. 300–306).** A new supplier claims a hardness of 5. Nine parts: mean 4.789, s = 0.2472. Normality: AD p = 0.442 → normal.

$H_0: \\mu = 5 \\qquad H_a: \\mu \\ne 5 \\qquad \\alpha = 0.05$

**Standard error:**

$$SE = \\dfrac{0.2472}{\\sqrt{9}} = \\dfrac{0.2472}{3} = 0.0824$$

**t statistic:**

$$t = \\dfrac{4.789 - 5}{0.0824} = \\dfrac{-0.211}{0.0824} = -2.56$$

**Critical value:** two-sided, df = 8, column 0.975 → **±2.306**. Since |−2.56| > 2.306, the result is in the rejection region.

**Confidence interval:**

$$4.789 \\pm 2.306 \\times 0.0824 = 4.789 \\pm 0.190 \\;\\Rightarrow\\; 4.599 \\text{ to } 4.979$$

The target 5 is **outside** the CI, and Minitab's **p = 0.034 < 0.05**. **Reject $H_0$.** Practical conclusion: the supplier's claim of 5 is not correct. (In a second book exercise, p = 0.201 and the target 32 ppm lies inside the CI → fail to reject.)`},{heading:"The 2-sample t: roadmap and output",body:`Hypotheses: $H_0: \\mu_1 = \\mu_2$; $H_a: \\mu_1 \\ne \\mu_2$ (two-tailed) or $>$ / $<$ (one-tailed).

**Roadmap (book pp. 311–324):** unstack the data if needed → **normality for each sample** → **test for equal variances** (F-test for two normal samples) → 2-sample t.

- Variances equal → tick **"Assume equal variances"** (pooled SD).
- Variances unequal → **untick** it (Welch / unpooled). Book: F-test p = 0.000 → unequal → untick.

Pooled standard deviation and statistic:

$$s_p = \\sqrt{\\dfrac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1+n_2-2}} \\qquad t = \\dfrac{\\bar{x}_1 - \\bar{x}_2}{s_p\\sqrt{\\dfrac{1}{n_1}+\\dfrac{1}{n_2}}}$$

**Book example (chlorine distributors):** n = 40 and 50, means 17.84 and 17.41; F-test p = 0.113 → pooled, $s_p$ = 3.5209.

$$t = \\dfrac{0.436}{3.5209 \\times \\sqrt{0.025 + 0.020}} = \\dfrac{0.436}{0.747} = 0.58$$

p = 0.561, CI (−1.049, 1.920) **contains 0** → fail to reject: no difference. Sample size is **per group**, and the detectable difference is set by the **smaller** group.`},{heading:"The paired t-test",body:`Use a **paired t** when two measurements come from the **same units** (before–after, two labs measuring the same parts). Pairing removes unit-to-unit variation, giving a **smaller error term** and a **more sensitive** test.

$H_0: \\mu_\\delta = 0$ (mean of the differences is zero). Compute the difference column, check it for normality, then run a 1-sample t on it against 0 (no equal-variance test — there is only one column). *Stat > Basic Statistics > Paired t* gives the same answer.

**Book example (shoe soles):** each of 10 children wears one sole of each material. Differences: mean 0.41, s = 0.3872.

$$t = \\dfrac{0.41}{\\dfrac{0.3872}{\\sqrt{10}}} = \\dfrac{0.41}{0.1224} = 3.35 \\qquad p = 0.009$$

CI (0.133, 0.687) excludes 0 → **reject $H_0$**: the materials wear differently.

**The wrong way:** a 2-sample t on the same data gives **p = 0.716** — the child-to-child variation hides the effect. Paired data must stay paired.`}],keyPoints:["t-tests compare means when σ is unknown; 1-sample (vs target), 2-sample (two groups), paired (same units).","t = (x̄ − target) ÷ (s ÷ √n), df = n − 1.","If the target lies inside the 95% CI, fail to reject H₀.","Before a 2-sample t: normality of each sample, then the equal-variance test (F-test for 2 normal samples).",'Equal variances → "Assume equal variances" ticked (pooled); unequal → unticked.',"Paired t = 1-sample t on the differences, H₀: μδ = 0; much more sensitive than a 2-sample t on paired data.","More than two means → ANOVA, not repeated t-tests."],examTips:["Expect a hand calculation of t from x̄, s, n and a target — divide by s ÷ √n, not by s.","Read Minitab output: P-value and whether the CI contains the target (1-sample) or 0 (2-sample, paired).","Trap: analysing before/after data on the same units with a 2-sample t.","Two-sided α = 0.05 → use the 0.975 column of the t-table with n − 1 df."]},{topic:"3.4.2",title:"1 sample variance",pages:"Book pp. 340–353",doc:"book-301-400",pdfPage:43,intro:"Six Sigma is about variation as much as about the mean. The **1-sample variance test** checks whether a process standard deviation (or variance) equals a target value. It belongs to the family of **tests of variance**, together with the F-test, Bartlett's test and Levene's test.",sections:[{heading:"The tests of variance family",body:`The book (p. 340): tests of variance are used for both normal and non-normal data.

| Data | Situation | Test |
|---|---|---|
| Normal | 1 sample vs a target | **1-sample variance** (chi-square) |
| Normal | 2 samples | **F-test** |
| Normal | 3 or more samples | **Bartlett's test** |
| Non-normal | 2 or more samples | **Levene's test** |

For the multi-sample tests the null hypothesis is that there is **no difference** between the standard deviations: $H_0: \\sigma_1 = \\sigma_2 = \\sigma_3 = \\dots$; $H_a$: at least one is different.

The hypotheses can be written for **standard deviations or variances** — they are the same question, because variance is the SD squared.

The book also notes a practical truth: **shifting a mean is usually easier than reducing variance**, so a supplier or process that already has low variation is valuable.`},{heading:"The 1-sample variance test: hypotheses and method",body:`A **1-sample variance test** compares a population variance with a **target**.

$$H_0: \\sigma^2 = \\sigma^2_{\\text{target}} \\qquad H_a: \\sigma^2 \\ne \\sigma^2_{\\text{target}}$$

**Book example (p. 341).** A new supplier says they can hold a hardness **variance of 0.10**. The statistical problem can be written two ways:

- $H_0: \\sigma^2 = 0.10$, $H_a: \\sigma^2 \\ne 0.10$, **or**
- $H_0: \\sigma = 0.31$, $H_a: \\sigma \\ne 0.31$ (because $\\sqrt{0.10} \\approx 0.31$).

α = 0.05, β = 0.10. For sample size the book says to **use the 1-sample t sample-size calculation**.

**Decision by confidence interval (the book's method):** run *Stat > Basic Statistics > Graphical Summary* and read the **95% CI for StDev**. If the target **lies inside** the interval → **fail to reject $H_0$**. If it lies outside → reject.

The test assumes **normal data**, so check normality first (the same roadmap as always).`},{heading:"Worked example: the chi-square statistic",body:`Book data (the same 9 hardness values as the 1-sample t): s = 0.2472, so $s^2$ = 0.0611; AD p = 0.442 (normal). Target variance 0.10.

**Test statistic** (chi-square with n − 1 df):

$$\\chi^2 = \\dfrac{(n-1)s^2}{\\sigma_0^2} = \\dfrac{8 \\times 0.0611}{0.10} = 4.89$$

**Critical values** (df = 8, two-sided, α = 0.05): 2.180 (lower) and 17.535 (upper). 4.89 lies **between** them → **fail to reject $H_0$**.

**Same answer from the confidence interval:**

$$\\dfrac{(n-1)s^2}{\\chi^2_{\\text{upper}}} \\le \\sigma^2 \\le \\dfrac{(n-1)s^2}{\\chi^2_{\\text{lower}}} \\;\\Rightarrow\\; \\dfrac{0.489}{17.535} \\text{ to } \\dfrac{0.489}{2.180} = 0.028 \\text{ to } 0.224$$

Taking square roots gives the book's **95% CI for StDev: 0.167 to 0.474**. The target 0.31 is inside → fail to reject. Practical conclusion: the supplier's claim of a 0.10 variance is believable; the book suggests working with them to raise the mean slightly while keeping the low variance.`},{heading:"Why variance intervals are not symmetric",body:`Look again at the CI for σ: 0.167 to 0.474 around s = 0.247. The lower side is 0.080 away; the upper side is 0.227 away. The interval is **lopsided**.

The book explains why (p. 349): the asymmetry comes from the **skewness of the chi-square distribution**. Chi-square is bounded at zero and has a long right tail, so intervals built from it stretch further upward than downward.

Practical consequences:

- With **small samples** the CI for σ is very wide. Nine values can only say "σ is somewhere between 0.17 and 0.47". To pin variation down you need many more data than for a mean.
- The chi-square variance test is **sensitive to non-normality**. If the data are skewed or have outliers, a variance test on them can mislead — which is why the roadmap checks normality first and uses **Levene** for non-normal data when comparing groups.

The same skewness explains the asymmetric **Bonferroni intervals** in Minitab's *Test for Equal Variances* graph.`},{heading:"Beyond one sample: F, Bartlett and Levene",body:`To compare variances of **groups**, use *Stat > ANOVA > Test for Equal Variances* (stack the data into a response column and a factor column).

**F-test (2 normal samples):**

$$F = \\dfrac{s_1^2}{s_2^2}$$

**Book example (p. 353):** ppm VOC with supplier A ($s^2$ = 50.265) and supplier B ($s^2$ = 43.182), both normal:

$$F = \\dfrac{50.265}{43.182} = 1.16 \\qquad p = 0.806$$

p > 0.05 → fail to reject: the two suppliers have equal variances.

**Bartlett** (normal, 2 or more factor levels) and **Levene** (any continuous distribution) appear together when there are more than two groups. Potato-rot example with Temp × Oxygen: Bartlett 2.71 (p = 0.744), Levene 0.37 (p = 0.858) → equal variances. For a non-normal pair (Rot 2) the book reads **only Levene** (p = 0.860), not the F-test.

Equal-variance results feed straight into the 2-sample t (pooled or not) and into ANOVA.`}],keyPoints:["1-sample variance compares one population variance (or SD) with a target.","H₀: σ² = σ²target — can be written for σ or σ² (0.10 variance ↔ 0.31 SD).","Statistic: χ² = (n − 1)s² ÷ σ₀², with n − 1 degrees of freedom.","Target inside the 95% CI for σ → fail to reject H₀.","Variance CIs are asymmetric because the chi-square distribution is skewed.","F-test = 2 normal samples; Bartlett = 3+ normal; Levene = non-normal.","Shifting a mean is usually easier than reducing variance."],examTips:["A question may give the target as a variance and the CI as an SD (or the reverse) — square or square-root before comparing.","Know that the 1-sample variance test uses the chi-square distribution, not t or F.","Trap: choosing the F-test or Bartlett for non-normal data — the answer is Levene.","If asked why the CI for σ is not centred on s, answer: chi-square skewness."]},{topic:"3.4.3",title:"One Way ANOVA",pages:"Book pp. 354–366 (variance and normality tests pp. 340–349)",doc:"book-301-400",pdfPage:57,intro:"One-way ANOVA (analysis of variance) tests whether **three or more means** are equal, using one factor with several levels. It extends the 2-sample t-test without inflating alpha. The syllabus includes the checks around it: **normality, equal variance, sample size, running the test and reading the results**.",sections:[{heading:"Purpose and hypotheses",body:`The book (p. 354): ANOVA investigates the relationship between a response and one or more independent variables. It **extends the 2-sample t-test** to compare **more than two means**.

- The factor usually has **three or more levels** (with only two levels a t-test can be used).
- $H_0: \\mu_1 = \\mu_2 = \\mu_3 = \\dots$ ; $H_a$: **at least one** mean is different.

**Why not several t-tests?** Each test carries its own α, and the overall risk grows:

$$\\alpha_{\\text{overall}} = 1 - (1 - \\alpha)^k$$

With 7 pairs of means and α = 0.05:

$$1 - (0.95)^7 = 1 - 0.698 = 0.30$$

The real risk could be as high as **30%**, which the book calls quite unacceptable. ANOVA tests all the means at once at α = 0.05.

A significant ANOVA says only that **some** mean differs. To see which, look at the means' confidence intervals (or a multiple-comparison method).`},{heading:"The logic: between versus within variation",body:`ANOVA asks: **is the variation between the group means large compared with the variation within the groups?**

Total variation splits into two parts:

$$SS_{\\text{total}} = SS_{\\text{between}} + SS_{\\text{within}}$$

- $SS_{\\text{between}} = \\sum n_j (\\bar{x}_j - \\bar{\\bar{x}})^2$ — how far each group mean is from the grand mean.
- $SS_{\\text{within}} = \\sum \\sum (x_{ij} - \\bar{x}_j)^2$ — how far each value is from its own group mean (error).

Each SS is divided by its degrees of freedom to give a **mean square (MS)**:

$$MS_{\\text{between}} = \\dfrac{SS_{\\text{between}}}{g - 1} \\qquad MS_{\\text{within}} = \\dfrac{SS_{\\text{within}}}{N - g}$$

The test statistic is their ratio:

$$F = \\dfrac{MS_{\\text{between}}}{MS_{\\text{within}}}$$

(g = number of groups, N = total observations.) If $H_0$ is true, F is near 1. A large F means the group means differ by more than the noise can explain.`},{heading:"The roadmap: normality, equal variance, sample size",body:`Before the ANOVA itself, the book follows the roadmap (pp. 356–359):

1. **Normality of each group** — Anderson-Darling, $H_0$: data are normal. Book suppliers: p = 0.568, 0.385, 0.910 → all normal.
2. **Equal variances** — *Stat > ANOVA > Test for Equal Variances* (stack the data first). Use **Bartlett** for normal data, **Levene** for non-normal data. Book: Bartlett 2.11, p = 0.348 (Levene p = 0.568) → equal variances.
3. **Sample size** — *Power and Sample Size > One-way ANOVA*. The sample size is **per level**. Book: with **n = 5 per level** (3 levels, power 0.9, σ = 1) the smallest detectable difference is **2.57 standard deviations** — a large difference. A larger sample gives a more sensitive test.

If the data are clearly non-normal, the roadmap switches to **Kruskal-Wallis** or **Mood's median**.

In Minitab: *Stat > ANOVA > One-Way* (stacked data) or *One-Way (Unstacked)*; tick **Assume equal variances** when the variance test supports it.`},{heading:"Worked example: three suppliers",body:`Book data (p. 358): 5 parts from each of suppliers A, B, C; means 3.664, 3.968, 4.030.

| Source | DF | SS | MS | F | P |
|---|---|---|---|---|---|
| Factor | 2 | 0.384 | 0.192 | 1.40 | 0.284 |
| Error | 12 | 1.641 | 0.137 | | |
| Total | 14 | 2.025 | | | |

Check the numbers:

$$MS_{\\text{factor}} = \\dfrac{0.384}{2} = 0.192 \\qquad MS_{\\text{error}} = \\dfrac{1.641}{12} = 0.137 \\qquad F = \\dfrac{0.192}{0.137} = 1.40$$

**Degrees of freedom:** between = 3 − 1 = 2; within = 3 × (5 − 1) = 12. **Critical F (2, 12) at α = 0.05 = 3.89.** 1.40 < 3.89 and p = 0.284 > 0.05 → **fail to reject $H_0$**: no significant difference between the suppliers' means, so the cheapest supplier can be chosen on quality grounds.

Also in the output: pooled SD S = 0.3698 and

$$R^2 = \\dfrac{SS_{\\text{factor}}}{SS_{\\text{total}}} = \\dfrac{0.384}{2.025} = 19\\%$$

— only 19% of the variation is explained by supplier.`},{heading:"Assumptions and residual checks",body:`The book's three ANOVA assumptions (p. 360):

1. Observations are adequately described by the model.
2. **Errors are normally and independently distributed.**
3. **Homogeneity of variance** among the factor levels.

Model adequacy can be checked in two ways: test normality per level plus equal variances (the roadmap), **or examine the residuals**. A **residual** is the difference between what the model predicts (the group mean) and the actual observation.

Residual plots (*Graphs > Four in one*):

- **Normal probability plot** — points on a straight line ("does a pencil cover all the dots?").
- **Histogram** — roughly bell-shaped.
- **Residuals versus fits** — checks **constant variance**; it should be structureless, with no funnel and no outliers.
- **Residuals versus order** — checks **independence**; no trends or cycles over time.

The book's rule: "If the model is adequate the residual plots will be **structureless**." Always look at them before trusting the p-value.`},{heading:"A significant result: the shift exercise",body:`**Book exercise (pp. 363–366).** Does ppm VOC differ between three production shifts (8 values each)?

1. Normality per shift: p = 0.446, 0.334, 0.658 → normal.
2. Equal variances: Bartlett 0.63, p = 0.729 → equal → tick *Assume equal variances*.
3. One-way ANOVA with four-in-one residual plots: residuals look normal (AD p = 0.698) and randomly scattered → the model is valid.
4. ANOVA **p < 0.05** → **reject $H_0$**: mean ppm VOC is not the same for all shifts.

**Which shift?** The shift means are 39.5, 34.6 and 28.0. The 95% CIs for the means of **shift 1 and shift 3 do not overlap**, so those two clearly differ; shift 1 gives the highest VOC.

**Wording note.** The book writes "we accept the alternate hypothesis". In exam language say "**reject $H_0$** — there is sufficient evidence that at least one shift mean is different." ANOVA tells you *that* a difference exists; the interval plot or a follow-up comparison tells you *where*.`}],keyPoints:["One-way ANOVA compares 3+ means of one factor; H₀: all means equal, Hₐ: at least one differs.","F = MS between ÷ MS within; large F (small p) → reject H₀.","df between = groups − 1; df within = N − groups.","Pairwise t-tests inflate α: 1 − (1 − α)^k (7 pairs ≈ 30%).","Roadmap: normality per level → Bartlett (normal) or Levene (non-normal) → ANOVA.","Assumptions: normal, independent errors and equal variances; check structureless residual plots.","ANOVA sample size is per level; n = 5 per level detects only ≈ 2.57σ."],examTips:["Expect to fill in a missing cell of an ANOVA table (MS = SS ÷ DF; F = MS factor ÷ MS error).","Compare calculated F with critical F using (between df, within df) — numerator first.","A significant ANOVA does not say which mean differs — distractors often claim it does.","Residuals vs fits checks equal variance; residuals vs order checks independence; normal plot checks normality."]},{topic:"3.5.1",title:"Mann-Whitney",pages:"Book pp. 370–385",doc:"book-301-400",pdfPage:73,intro:"The Mann-Whitney test compares the **medians of two independent groups** without assuming normal data. It is the non-parametric alternative to the 2-sample t-test. It works on ranks, so skewed data and outliers do not break it.",sections:[{heading:"Non-parametric tests in general",body:`The book (p. 376): a **non-parametric test makes no assumption about normality**.

- For a **skewed** distribution the right measure of centre is the **median**, not the mean — outliers pull the mean but the median stays centred.
- If **just one** of the distributions is not normal, use a non-parametric test.
- Non-parametric tests work like parametric ones: state $H_0$ and $H_a$, then compare the **p-value with α** in the same way.
- In general they **rank the data, sum the ranks, sign the data above or below a target**, and test the median.

The non-normal roadmap (pp. 370–375): check **normality** (AD) → test **equal variance with Levene's test** (stack the data first) → test the **medians**.

Sample size: divide the t-test sample size by 0.864:

$$n_{\\text{non-parametric}} = \\dfrac{n_{t\\text{-test}}}{0.864}$$

For example, 23 for a t-test becomes about 27.`},{heading:"What Mann-Whitney tests",body:`The book (p. 377): Mann-Whitney performs a hypothesis test of the **equality of two population medians** and gives a **point estimate and confidence interval** for the difference. Use it as the non-parametric alternative to the **2-sample t-test**.

$$H_0: M_1 = M_2 \\qquad H_a: M_1 \\ne M_2$$

(Minitab writes the medians as ETA1 and ETA2.)

Conditions:

- **Two independent** groups (different units in each group). For paired data use a sign or Wilcoxon test on the differences instead.
- Continuous (or ordinal) data that can be ranked.
- For a clean "difference in medians" reading, the two distributions should have **similar shapes** (one is shifted from the other). If the variances differ strongly (Levene p < 0.05), investigate the shape — the book says unequal variances usually come from extreme tails, outliers or multiple modes.

Example question from the book: *Do two machines have different median cycle times?*`},{heading:"How the statistic works: merge, rank, sum",body:`1. **Merge** both samples and **rank** all values from smallest (rank 1) to largest. Ties share the average rank.
2. **Sum the ranks** of each group.
3. Convert a rank sum into the **U statistic**:

$$U_A = R_A - \\dfrac{n_A(n_A+1)}{2}$$

If the medians are equal, the ranks are well mixed and U is near the middle value $n_A n_B$ divided by 2. A U near 0 or near $n_A n_B$ means one group sits mostly below the other.

**Small worked example.** A: 3, 5, 8. B: 6, 9, 10, 12. Combined ranks: 3→1, 5→2, 6→3, 8→4, 9→5, 10→6, 12→7.

$$R_A = 1 + 2 + 4 = 7 \\qquad U_A = 7 - \\dfrac{3 \\times 4}{2} = 1 \\qquad U_B = 3 \\times 4 - 1 = 11$$

U_A = 1 is far from the middle value 6, so group A tends to be lower. (With such tiny samples the exact p-value is still above 0.05 — small samples have little power.) Minitab reports the rank sum as **W**.`},{heading:"Reading Minitab output: two book examples",body:`*Stat > Nonparametrics > Mann-Whitney*.

**Example 1 — machine cycle times (p. 383).** 200 values per machine; Mach A non-normal (AD p < 0.005), Mach B normal (p = 0.099) → use Mann-Whitney.

- Medians: 14.841 and 16.346
- Point estimate for ETA1 − ETA2: **−1.604**
- 95% CI for ETA1 − ETA2: **(−2.635, −0.594)**
- "Test of ETA1 = ETA2 vs ETA1 not = ETA2 is significant at **0.0019**" — this line **is the p-value**.

**Zero is not inside the CI** and p < 0.05 → **reject $H_0$**: the machines have different median cycle times. If the medians were the same, zero would be inside the interval.

**Example 2 — credit-card call volume (p. 384).** Medians 739 vs 770 calls; estimate −26.5; CI (−91.9, 43.0) **contains 0**; significant at **0.4580** → **fail to reject**: no difference in call volume between the two card types.

(The book's margin note says "0.0010" for example 1, but the printed output shows 0.0019 — use the output.)`},{heading:"Power and choosing Mann-Whitney",body:`**Mann-Whitney vs 2-sample t.**

| Situation | Best choice |
|---|---|
| Both groups normal | 2-sample t (slightly more power) |
| At least one group skewed or with outliers | **Mann-Whitney** |
| Paired measurements | Sign / Wilcoxon on differences, or paired t |
| Three or more groups | Kruskal-Wallis or Mood's median |

When data really are normal, Mann-Whitney loses only a little power (that is the source of the 0.864 factor). When data are skewed, it can be **more** powerful than the t-test, because outliers inflate the t-test's standard deviation.

**Wording caution.** The book says "only one has to be normal" for a two-sample non-parametric test. The safe rule — also stated by the book on p. 376 — is the opposite way round: **if even one sample is non-normal, use the non-parametric test.**

Always end with a practical statement: which machine, line or card type is better, and by how much (the point estimate of the median difference).`}],keyPoints:["Mann-Whitney compares the medians of two independent groups; alternative to the 2-sample t-test.","H₀: M₁ = M₂; Hₐ: M₁ ≠ M₂ (Minitab: ETA1, ETA2).","It ranks the combined data and compares rank sums (W / U); no normality needed.","If 0 is inside the CI for ETA1 − ETA2, fail to reject H₀.",'The line "significant at …" in Minitab is the p-value.',"Use a non-parametric test if even one sample is non-normal.","Non-parametric sample size ≈ t-test n ÷ 0.864."],examTips:["Scenario: two independent groups + skewed data → Mann-Whitney (not paired, not 3+ groups).",'Know where the p-value is in Mann-Whitney output ("is significant at").',"Trap: Mann-Whitney offered for paired/before-after data on the same units.","Remember the counterpart pairing: Mann-Whitney ↔ 2-sample t."]},{topic:"3.5.2",title:"Kruskal-Wallis",pages:"Book pp. 376–390",doc:"book-301-400",pdfPage:79,intro:"The Kruskal-Wallis test compares the **medians of three or more independent groups** without assuming normality. It is the non-parametric alternative to one-way ANOVA. It ranks all the data together and checks whether some groups collect mostly high or mostly low ranks.",sections:[{heading:"What Kruskal-Wallis tests",body:`The book (p. 377): Kruskal-Wallis performs a hypothesis test of the **equality of population medians for a one-way design** (one factor, several levels). Use it as an **alternative to one-way ANOVA**.

$$H_0: M_1 = M_2 = \\dots = M_k \\qquad H_a: \\text{at least one median is different}$$

Compared with **Mood's median** (the other one-way median test), the book says Kruskal-Wallis is:

- **more powerful** — its confidence intervals are narrower on average, so it finds real differences more easily;
- **less robust to outliers** — extreme values affect it more.

Conditions: independent groups; continuous or ordinal data; groups with **similar shapes** (so that a difference in ranks means a difference in medians). Like ANOVA, a significant result says *some* median differs, not which one.

Roadmap: normality → Levene for equal variance (stack the data) → Kruskal-Wallis.`},{heading:"How the H statistic is calculated",body:`1. Rank **all** N observations together (1 = smallest); ties get the average rank.
2. Add the ranks in each group: $R_j$ for group j with $n_j$ values.
3. Calculate

$$H = \\dfrac{12}{N(N+1)} \\sum \\dfrac{R_j^2}{n_j} - 3(N+1)$$

4. Compare H with the **chi-square** distribution with **k − 1** degrees of freedom (k = number of groups). Large H → small p → reject $H_0$.

If $H_0$ is true, every group's **average rank** should be close to the overall average rank:

$$\\bar{R} = \\dfrac{N+1}{2}$$

Groups whose average rank is far from this value drive H up. Minitab prints each group's **Ave Rank** and a **Z** value: a large positive Z means that group ranks high; a large negative Z means it ranks low. When there are ties Minitab prints a second line, **"adjusted for ties"** — use that one.`},{heading:"Worked example by hand",body:`Three groups of 3 values. A: 10, 12, 14. B: 13, 16, 18. C: 17, 20, 22. N = 9.

Ranks of the combined data: 10→1, 12→2, 13→3, 14→4, 16→5, 17→6, 18→7, 20→8, 22→9.

$$R_A = 1+2+4 = 7 \\qquad R_B = 3+5+7 = 15 \\qquad R_C = 6+8+9 = 23$$

Check: the ranks must add to N(N+1) divided by 2 = 45, and 7 + 15 + 23 = 45. ✓

$$H = \\dfrac{12}{9 \\times 10} \\left( \\dfrac{7^2}{3} + \\dfrac{15^2}{3} + \\dfrac{23^2}{3} \\right) - 3 \\times 10 = \\dfrac{12}{90} \\times 267.7 - 30 = 5.69$$

Degrees of freedom = 3 − 1 = 2. Critical chi-square (α = 0.05, df 2) = **5.99**. 5.69 < 5.99 → p ≈ 0.058 → **fail to reject $H_0$**.

The groups look different, but with only 3 values each the test cannot prove it at α = 0.05 — a reminder that non-parametric tests need enough data.`},{heading:"Book example: aluminium recovery at three plants",body:`**Practical problem (pp. 385–388).** Compare recovery at Ankhar (n = 20), Bangor (n = 13) and Savannah (n = 25) with 95% confidence.

- Normality (Graphical Summary): AD p = 0.022, 0.045, 0.032 → all **non-normal**, with outliers.
- Equal variance: Levene p = 0.367 → variances equal.

Kruskal-Wallis output:

| Location | N | Median | Ave Rank | Z |
|---|---|---|---|---|
| Ankhar | 20 | 88.43 | 27.3 | −0.73 |
| Bangor | 13 | 94.80 | 40.2 | 2.60 |
| Savannah | 25 | 87.50 | 25.7 | −1.49 |
| Overall | 58 | | 29.5 | |

**H = 6.86, DF = 2, P = 0.032** (6.87 adjusted for ties, P = 0.032).

p < 0.05 → **reject $H_0$**: at least one plant's median recovery is different. Bangor's average rank (40.2) and Z (+2.60) stand out: **Bangor has the highest recovery**. Mood's median on the same data reaches the same conclusion (p = 0.002). The book calls the KW output "the least friendly to interpret — look for the p-value".`},{heading:"Choosing and avoiding traps",body:`**Choosing among one-way tests:**

| Data | Test |
|---|---|
| Normal, equal variances | One-way ANOVA |
| Non-normal, few outliers | **Kruskal-Wallis** (more power) |
| Non-normal, many / extreme outliers | **Mood's median** (more robust) |
| Blocked design (each block gets every treatment) | Friedman |

**Practical steps in Minitab:** data must be **stacked** (one response column, one factor column) — *Stat > Nonparametrics > Kruskal-Wallis*.

**Traps:**

- The book says on p. 388 that "the Kruskal-Wallis test showed the variances were equal". That is wrong: **Kruskal-Wallis tests medians**; equal variance comes from Levene or Bartlett.
- Unequal variances in non-normal data usually signal different **shapes** (extreme tails, outliers, multiple modes). Explore them with data demographics before trusting any median test.
- When a p-value is borderline, the book advises using **process knowledge** to make the final judgement.`}],keyPoints:["Kruskal-Wallis compares medians of 3+ independent groups; alternative to one-way ANOVA.","H₀: all medians equal; Hₐ: at least one differs.","It ranks all data together; H is compared with chi-square on k − 1 df.","More powerful than Mood’s median but less robust to outliers.",'Minitab shows Ave Rank and Z per group; use the "adjusted for ties" line.',"Book example: H = 6.86, p = 0.032 → reject; Bangor highest.","Data must be stacked; check normality and Levene first."],examTips:['KW vs Mood’s: "more powerful" = Kruskal-Wallis; "more robust to outliers" = Mood’s median.',"Counterpart question: Kruskal-Wallis ↔ one-way ANOVA.","Degrees of freedom = number of groups − 1, not N − 1.","A significant KW does not say which group differs — look at average ranks / Z values."]},{topic:"3.5.3",title:"Mood’s Median",pages:"Book pp. 376–390",doc:"book-301-400",pdfPage:79,intro:"Mood's median test compares the **medians of two or more independent groups** by counting how many values in each group fall above and below the overall median. Because it only counts, it is very **robust to outliers**. It is an alternative to one-way ANOVA and a close cousin of Kruskal-Wallis.",sections:[{heading:"What Mood’s median tests",body:`The book (p. 377): Mood's median test performs a hypothesis test of the **equality of population medians in a one-way design**. It is similar to Kruskal-Wallis and is also called the **median test** or **sign scores test**. Use it as an **alternative to one-way ANOVA**.

$$H_0: M_1 = M_2 = M_3 = \\dots \\qquad H_a: \\text{at least one median is different}$$

Strengths and weaknesses compared with Kruskal-Wallis:

- **More robust to outliers** — an extreme value counts only as "above" or "below", however far away it is.
- **Less powerful** — it throws away the size of the differences, so it needs more data to find a real difference.

Use it for non-normal continuous data from independent groups, especially when outliers are present. Roadmap: normality → Levene → Mood's median. In Minitab the data must be **stacked**: *Stat > Nonparametrics > Mood's Median Test*.`},{heading:"How it works: a chi-square on counts",body:`1. Find the **overall median** of all the data combined.
2. For each group, count values **≤ the overall median** (N≤) and **> the overall median** (N>).
3. This makes a **2 × k table** of counts.
4. Run a **chi-square test** on the table:

$$\\chi^2 = \\sum \\dfrac{(O - E)^2}{E} \\qquad df = k - 1$$

If $H_0$ is true, each group should have about **half** its values on each side of the overall median, so the expected count in each cell is half the group size:

$$E = \\dfrac{n_j}{2}$$

(More precisely, row total × column total divided by the grand total — which gives the same half-and-half when the overall split is even.)

A group with most of its values on one side produces large (O − E) terms and a large chi-square → small p → reject $H_0$. The book's rule for chi-square tables applies: aim for **at least 5 expected counts per cell**.`},{heading:"Worked example from the book’s output",body:`**Aluminium recovery (p. 387).** Overall median = 88.9; N = 58, split 29 ≤ and 29 >.

| Location | N≤ | N> | n | Expected each side |
|---|---|---|---|---|
| Ankhar | 13 | 7 | 20 | 10 |
| Bangor | 1 | 12 | 13 | 6.5 |
| Savannah | 15 | 10 | 25 | 12.5 |

Chi-square contributions (both cells of each row):

$$\\text{Ankhar: } \\dfrac{(13-10)^2}{10} + \\dfrac{(7-10)^2}{10} = 0.9 + 0.9 = 1.80$$

$$\\text{Bangor: } \\dfrac{(1-6.5)^2}{6.5} + \\dfrac{(12-6.5)^2}{6.5} = 4.65 + 4.65 = 9.31$$

$$\\text{Savannah: } \\dfrac{(15-12.5)^2}{12.5} + \\dfrac{(10-12.5)^2}{12.5} = 0.5 + 0.5 = 1.00$$

$$\\chi^2 = 1.80 + 9.31 + 1.00 = 12.11 \\qquad df = 3 - 1 = 2$$

This matches Minitab: **Chi-Square = 12.11, DF = 2, P = 0.002**. Critical chi-square (df 2) = 5.99 → **reject $H_0$**. Bangor (12 of 13 above the overall median) drives the result.`},{heading:"Reading the rest of the output",body:`Minitab's Mood's median output also gives, for each group:

- **Median** — Ankhar 88.4, Bangor 94.8, Savannah 87.5.
- **Q3 − Q1** — the interquartile range (spread): 4.5, 6.8, 17.6. Savannah's spread is much wider.
- **Individual 95% CIs for each median**, drawn as a text interval plot.

The book's reading: Bangor's interval **does not overlap** the others, "so we visually know the p-value is below 0.05".

- **Statistical conclusion:** p = 0.002 < 0.05 → reject $H_0$.
- **Practical conclusion:** **Bangor has the highest recovery** of the three plants.

**Cell-phone exercise (p. 390).** Three months of ppm-defective data, all non-normal, stacked, then Mood's median: **p > 0.05**. The book writes "accept the null hypothesis"; in exam language say **fail to reject $H_0$** — no evidence that the median defect rate changed between months.`},{heading:"Mood’s median versus Kruskal-Wallis",body:`Both test medians of independent groups in a one-way design, and on the recovery data both reject $H_0$ (Mood p = 0.002; KW p = 0.032).

| | **Mood's median** | **Kruskal-Wallis** |
|---|---|---|
| Uses | Counts above / below the overall median | Ranks of all values |
| Statistic | Chi-square | H (compared with chi-square) |
| Power | Lower | **Higher** (narrower CIs on average) |
| Outliers | **Very robust** | Less robust |
| Book's verdict | — | "The Kruskal-Wallis test is better" (in this example) |
| Groups | 2 or more | 2 or more (usually 3+) |

How to choose: if the data are non-normal but reasonably well-behaved, use **Kruskal-Wallis** for its power. If there are **extreme outliers** or very different shapes, use **Mood's median** for its robustness. Either way, check equal variance with **Levene** first and explore any unequal variances with data demographics.`}],keyPoints:["Mood’s median compares medians of 2+ independent groups; alternative to one-way ANOVA.","Also called the median test or sign scores test.","Counts values ≤ and > the overall median in each group, then runs a chi-square test (df = k − 1).","Very robust to outliers but less powerful than Kruskal-Wallis.","Book example: χ² = 12.11, df 2, p = 0.002 → reject; Bangor highest.","Non-overlapping individual median CIs signal a significant difference.","Stack the data before running it."],examTips:['Match the description: "robust to outliers, counts above/below the grand median" = Mood’s median.',"Its test statistic is chi-square — a common question.","Trap: Mood’s median does not assume normality or use means.",'Wording: replace the book’s "accept the null" with "fail to reject H₀".']},{topic:"3.5.4",title:"Friedman",pages:"Syllabus + academy lessons",doc:"syllabus",pdfPage:8,intro:"The Friedman test compares treatments in a **randomized block design** — every treatment is tried once in every block (day, shift, operator) — without assuming normality. It is the non-parametric counterpart of **two-way ANOVA without replication**. The course book has no Friedman content, so this lesson rests on the syllabus (topic 3.5.4) and the academy lesson.",sections:[{heading:"The design: treatments and blocks",body:`A **block** is a group of units that share a nuisance factor you cannot remove but can hold constant — a day, a shift, an engineer, a site. A **treatment** is the factor you actually care about — a method, tool, vendor or algorithm.

In a **randomized block design** each block gets **every treatment exactly once** (in random order). The data form a table: rows = blocks, columns = treatments.

**Example (academy lesson).** Three routing algorithms (A, B, C) run on each of 6 days; Y = p95 latency in ms (lower is better). Latency changes a lot from day to day, so comparing algorithms *within* each day removes the day effect.

Why Friedman and not another median test?

- The columns are **related** (they share a day), so Kruskal-Wallis and Mood's median — which need **independent** groups — are wrong.
- There is **one value per cell**, so the parametric version is two-way ANOVA without replication.
- Latency is skewed and the groups are small, so **normality is doubtful**.`},{heading:"Hypotheses and assumptions",body:`$$H_0: \\text{all treatment medians are equal (after removing block effects)}$$

$$H_a: \\text{at least one treatment median is different}$$

Like ANOVA and Kruskal-Wallis, a significant result says **at least one** treatment differs, not which one; the rank sums show where the difference is.

Assumptions:

- **Blocks are independent** of each other.
- Within a block, values can be **ranked** (continuous or ordinal data).
- **One observation per treatment per block**.
- No strong treatment × block interaction (the ordering of treatments is broadly similar from block to block).
- **No normality** and **no equal-variance** assumption — the whole point of the test.

Where it sits in the non-parametric family:

| Design | Parametric | Non-parametric |
|---|---|---|
| 2 independent groups | 2-sample t | Mann-Whitney |
| 3+ independent groups | One-way ANOVA | Kruskal-Wallis / Mood's |
| Treatments × blocks | Two-way ANOVA (no replication) | **Friedman** |`},{heading:"Calculating the Friedman statistic S",body:`**Step 1 — rank within each block** (each row 1 to k on its own; ties share the average rank).

| Day | A | B | C |
|---|---|---|---|
| 1–6 ranks | 3,3,2,3,3,3 | 2,2,3,2,1,2 | 1,1,1,1,2,1 |
| **Rank sum $R_j$** | **17** | **12** | **7** |

Check: b = 6 blocks, k = 3 treatments; all ranks must total b × k(k + 1) divided by 2 = 36; 17 + 12 + 7 = 36. ✓

**Step 2 — the statistic:**

$$S = \\dfrac{12}{b\\,k\\,(k+1)} \\sum R_j^2 - 3\\,b\\,(k+1)$$

$$S = \\dfrac{12}{6 \\times 3 \\times 4}\\,(17^2 + 12^2 + 7^2) - 3 \\times 6 \\times 4 = \\dfrac{12}{72} \\times 482 - 72 = 8.33$$

**Step 3 — compare with chi-square, df = k − 1 = 2.** Critical value at α = 0.05 = **5.99**. 8.33 > 5.99 (p = 0.016) → **reject $H_0$**. Algorithm C has the lowest rank sum: it was fastest on 5 of the 6 days.`},{heading:"Why blocking matters",body:`Run **Kruskal-Wallis** on the same three columns as if they were independent groups: **H = 1.84, p = 0.40** — no evidence. **One-way ANOVA** gives F = 1.09, p = 0.36. Yet Friedman on the same numbers gives **p = 0.016**.

The reason is the day-to-day swing. Busy days are around 65–75 ms for every algorithm; quiet days around 36–43 ms. Pooled together, this between-day noise is much bigger than the 5–9 ms advantage of algorithm C, so tests that ignore the blocks drown in it.

Ranking **within** each day removes the day effect completely: a busy day and a quiet day each contribute one set of ranks 1, 2, 3.

If all treatments were equal, each rank sum would be close to:

$$\\dfrac{b\\,(k+1)}{2} = \\dfrac{6 \\times 4}{2} = 12$$

The further the rank sums move from this value (here 17 and 7), the larger S becomes. **Blocking removes a known nuisance source of variation** — the core exam idea.`},{heading:"Reading Minitab’s Friedman output",body:`Path: *Stat > Nonparametrics > Friedman*. Three columns are needed (stacked data): **Response** (latency), **Treatment** (algorithm), **Blocks** (day).

The session window shows:

- **S = 8.33, DF = 2, P = 0.016** — the statistic, its degrees of freedom (k − 1) and the chi-square p-value.
- If any block has ties, a second line **"S = … (adjusted for ties)"**; the adjusted S is slightly larger — report that line when ties exist.
- For each treatment: **N**, an **estimated median** (block-adjusted, so it can differ from the raw column median) and the **sum of ranks** (17, 12, 7).
- The **grand median**.

Interpretation follows the usual rule: **p < α → reject $H_0$**; otherwise **fail to reject $H_0$** (never "accept"). Then use the sums of ranks to say which treatment looks best.

Limits: the chi-square approximation is rough with very few blocks and treatments; and because Friedman keeps only the order inside each block, it has less power than two-way ANOVA **when** the ANOVA assumptions hold.`}],keyPoints:["Friedman = non-parametric test of treatment medians in a randomized block design.","Every treatment appears once in every block; samples are related, not independent.","Non-parametric counterpart of two-way ANOVA without replication.","Rank within each block, sum ranks per treatment, compute S.","S is compared with chi-square on k − 1 degrees of freedom.","Blocking removes nuisance variation; ignoring blocks (Kruskal-Wallis) can hide a real effect.","Not covered in the course book — learned from the syllabus and academy lesson."],examTips:['Scenario words "each operator tested every method" or "each day tried all treatments" + non-normal → Friedman.',"Trap: Kruskal-Wallis or Mood’s median for blocked/related data — they need independent groups.","Ranks are assigned within each block, never across the whole table.","Degrees of freedom = number of treatments − 1 (not blocks − 1)."]},{topic:"3.5.5",title:"Sample Sign",pages:"Book pp. 376–382",doc:"book-301-400",pdfPage:79,intro:"The 1-sample sign test is the simplest test of a median: count how many values are **above** and how many are **below** a target, and ask whether that split could be chance. It needs almost no assumptions, so it works for any continuous distribution. It is the non-parametric alternative to the 1-sample Z and t tests.",sections:[{heading:"What the sign test asks",body:`The book (p. 377): the **1-sample sign test** tests the **median** of one population and gives a point estimate and a confidence interval. Use it as an **alternative to the 1-sample Z and 1-sample t** tests when the data are not normal.

$$H_0: M = M_{\\text{target}} \\qquad H_a: M \\ne M_{\\text{target}} \\;(\\text{or } <, >)$$

The p-value is read exactly as in other tests: **p < α → reject $H_0$**.

**Assumptions:** a random sample of independent, continuous values. The sign test does **not** need normality and does **not** even need symmetry — that is its advantage over the Wilcoxon test. The price is **lower power**: it uses only the sign (+ or −) of each value relative to the target, not how far away it is.

For one sample against a target the book says you can choose **either** the 1-sample sign **or** the 1-sample Wilcoxon, because both test a median against a target. Sample size: divide the t-test n by 0.864.`},{heading:"Mechanics: signs and the binomial",body:`1. Compare each value with the target: **+** if above, **−** if below.
2. **Drop** values exactly equal to the target; reduce n.
3. If $H_0$ is true, each value is equally likely to be above or below the median, so the number of + signs follows a **binomial distribution with p = 0.5**.
4. The p-value is the probability of a split at least as uneven as the one observed:

$$P(X \\le x) = \\sum_{i=0}^{x} \\dfrac{\\binom{n}{i}}{2^n}$$

For a **two-sided** test, double the smaller tail.

For large n, Minitab uses a normal approximation, but the idea is the same: a 50/50 split supports $H_0$; a lopsided split (almost all above, or almost all below) is evidence against it.`},{heading:"Worked example: the mine’s target (book p. 382)",body:`**Practical problem.** Is the mine achieving its target of **2.1 tons/day**? 17 days of data, non-normal.

$H_0: M = 2.1 \\qquad H_a: M \\ne 2.1 \\qquad \\alpha = 0.05$

Counts: **14 days below**, **3 above**, 0 equal. Under $H_0$, X = number above ~ binomial(17, 0.5).

$$P(X \\le 3) = \\dfrac{\\binom{17}{0} + \\binom{17}{1} + \\binom{17}{2} + \\binom{17}{3}}{2^{17}} = \\dfrac{1 + 17 + 136 + 680}{131{,}072} = \\dfrac{834}{131{,}072} = 0.00636$$

Two-sided:

$$p = 2 \\times 0.00636 = 0.0127$$

This matches Minitab (**P = 0.0127, median = 1.800**). p < 0.05 → **reject $H_0$**.

**Practical conclusion:** the median output is 1.8 tons/day, below target — the mine is **not** achieving 2.1 tons/day, so the Black Belt disagrees with the manager's belief.`},{heading:"Reading Minitab’s output: the 63-minute cycle time",body:`**Book example (pp. 378–380).** An improved process must achieve a median cycle time of **63 minutes**; 500 values, right-skewed. *Stat > Nonparametrics > 1-Sample Sign*, alternative "not equal".

| N | Below | Equal | Above | P | Median |
|---|---|---|---|---|---|
| 500 | 37 | 0 | 463 | 0.0000 | 65.70 |

- **Below / Equal / Above** — the sign counts against the target.
- **P = 0.0000** < 0.05 → **reject $H_0$**: the median is not 63.
- **Median = 65.70** — higher than the target, which is the wrong direction for a cycle time.

**Confidence interval** (enter 95% in Minitab): the sign CI for the median is **65.26 to 66.50**, labelled **NLI** — a **non-linear interpolation** was used to hit exactly 95% (sign-test intervals can only take certain confidence levels, so Minitab also shows the neighbouring 94.55% and 95.58% intervals). 63 is **outside** the CI → reject $H_0$, the same conclusion.`},{heading:"Sign test versus Wilcoxon and t",body:`| | **1-sample sign** | **1-sample Wilcoxon** | **1-sample t** |
|---|---|---|---|
| Tests | Median | Median | Mean |
| Uses | Signs only | Signs **and** ranks of distances | Actual values |
| Needs normality? | No | No | Yes |
| Needs symmetry? | **No** | **Yes** | (normal) |
| Power | Lowest | Higher ("more discriminating" — book) | Highest if data normal |

**When to pick the sign test:** clearly **skewed** data, ordinal data, or data where you only know "above / below" the target.

**Paired data.** The sign test can also compare two **paired** measurements: take the differences (after − before) and test their median against 0 — count positive and negative differences.

**Book wording slip.** p. 378 says that with several columns "MINITAB performs a one-sample Wilcoxon test separately for each column". It means a **sign** test is run per column. Read it that way.`}],keyPoints:["1-sample sign test: median vs a target; alternative to the 1-sample Z and t tests.","H₀: M = M_target; count values above (+) and below (−); drop ties with the target.","Under H₀ the count follows a binomial with p = 0.5.","Needs neither normality nor symmetry, but has the lowest power.","Minitab output: N, Below, Equal, Above, P, Median; NLI = non-linear interpolation CI.","Target outside the CI for the median → reject H₀.","Mine example: 14 below, 3 above of 17 → p = 0.0127 → reject."],examTips:["Be ready to compute a small binomial p-value and double it for a two-sided test.","Distinguish: sign test needs no symmetry; Wilcoxon assumes symmetry.","Know what NLI means in the confidence-interval output.","Counterpart question: 1-sample sign ↔ 1-sample Z / t."]},{topic:"3.5.6",title:"Sample Wilcoxon",pages:"Book pp. 376–380",doc:"book-301-400",pdfPage:79,intro:"The 1-sample Wilcoxon signed-rank test checks whether the median of one population equals a target. It uses both the **sign** and the **size (rank)** of each distance from the target, so it is more discriminating than the sign test. It assumes the distribution is roughly **symmetric**.",sections:[{heading:"What the test asks and assumes",body:`The book (p. 377): the **1-sample Wilcoxon** performs a one-sample **signed-rank test of the median** and gives a point estimate and confidence interval. It is **more discriminating or efficient than the sign test**. Use it as a non-parametric alternative to the **1-sample Z and 1-sample t** tests.

$$H_0: M = M_{\\text{target}} \\qquad H_a: M \\ne M_{\\text{target}} \\;(\\text{or } <, >)$$

Assumptions:

- A random sample of independent continuous values.
- **Symmetric distribution** around the median (not necessarily normal). This is the key difference from the sign test.

Why symmetry? The test compares the ranks of distances above and below the target. If the distribution is skewed, the long tail produces large ranks on one side even when the median equals the target, and the test can mislead. For **strongly skewed** data, the sign test is the safer choice.`},{heading:"The procedure: signed ranks",body:`1. Subtract the target from each value: $d_i = x_i - M_0$.
2. **Drop** any zero differences and reduce n.
3. **Rank the absolute differences** $|d_i|$ from smallest (1) to largest. Ties share the average rank.
4. Give each rank the **sign** of its difference.
5. Add the positive ranks ($W^+$) and the negative ranks ($W^-$). They must total:

$$W^+ + W^- = \\dfrac{n(n+1)}{2}$$

6. If $H_0$ is true, $W^+$ and $W^-$ should be about equal. A very small $W^+$ or $W^-$ is evidence against $H_0$. For small n, compare the smaller of the two with a Wilcoxon table critical value (**reject if it is ≤ the critical value**); for large n, a normal approximation gives the p-value. Minitab reports $W^+$ as the **Wilcoxon statistic**.`},{heading:"Worked example by hand",body:`Six cycle times against a target of 63 min: 61, 65, 66, 68, 70, 72.

| Value | d = x − 63 | abs(d) | Rank | Signed rank |
|---|---|---|---|---|
| 61 | −2 | 2 | 1.5 | −1.5 |
| 65 | +2 | 2 | 1.5 | +1.5 |
| 66 | +3 | 3 | 3 | +3 |
| 68 | +5 | 5 | 4 | +4 |
| 70 | +7 | 7 | 5 | +5 |
| 72 | +9 | 9 | 6 | +6 |

$$W^+ = 1.5 + 3 + 4 + 5 + 6 = 19.5 \\qquad W^- = 1.5$$

Check:

$$\\dfrac{6 \\times 7}{2} = 21 = 19.5 + 1.5$$

For n = 6, two-sided α = 0.05, the critical value is **0**. The smaller sum, 1.5, is **not ≤ 0** → **fail to reject $H_0$**.

The data look higher than 63, but six values cannot prove it at α = 0.05. (The sign test on the same data — 5 above, 1 below — gives p = 0.22, even weaker.)`},{heading:"Reading Minitab’s output (book pp. 379–380)",body:`Same 500 cycle times, target 63 min. *Stat > Nonparametrics > 1-Sample Wilcoxon*.

| N | N for Test | Wilcoxon Statistic | P | Estimated Median |
|---|---|---|---|---|
| 500 | 500 | 124,015.0 | 0.000 | 67.83 |

- **N for Test** — values left after removing those equal to the target.
- **Wilcoxon Statistic** — the sum of positive ranks, $W^+$.
- **P = 0.000** → **reject $H_0$**: the median is not 63.
- **Estimated median 67.83** — higher than the target, the wrong direction.

95% CI for the median: **67.01 to 68.70**; 63 is outside → reject.

**Two notes.** (1) The sign test gave a median of 65.70; Wilcoxon's estimate (a Walsh-average median) is 67.83. The gap appears because these data are **strongly right-skewed**, which breaks the symmetry assumption. (2) The book says the Wilcoxon interval is "even tighter", but here its printed width (1.69) is wider than the sign interval (1.24). For the exam keep the general rule: **Wilcoxon is more efficient when the data are symmetric.**`},{heading:"Choosing among one-sample tests",body:`| Data | Best one-sample test |
|---|---|
| Normal | **1-sample t** (σ unknown) or Z (σ known) |
| Non-normal but symmetric (e.g. heavy tails) | **1-sample Wilcoxon** |
| Clearly skewed, or only above/below known | **1-sample sign** |

**Paired data.** Like the sign test, the Wilcoxon signed-rank test also works on **paired** data: compute the differences (after − before) and test their median against 0. It is the non-parametric partner of the paired t-test. (The book only shows the one-sample form.)

**Sample size:** as for all non-parametric tests, use

$$n_{\\text{non-parametric}} = \\dfrac{n_{t\\text{-test}}}{0.864}$$

**Decision rules** are the same as everywhere: p < α → reject $H_0$; or, if the target is outside the CI for the median → reject. Always finish with a practical conclusion (is the process better or worse than target, and by how much?).`}],keyPoints:["1-sample Wilcoxon: signed-rank test of one median against a target.","More discriminating (efficient) than the sign test; alternative to the 1-sample Z / t.","Assumes a symmetric distribution; does not assume normality.","Rank the absolute differences from the target, attach signs, sum W⁺ and W⁻.",'W⁺ + W⁻ = n(n + 1) ÷ 2; Minitab’s "Wilcoxon Statistic" is W⁺.',"Book example: N 500, statistic 124,015, p = 0.000, estimated median 67.83 → reject.","Strongly skewed data → prefer the sign test."],examTips:["Sign vs Wilcoxon: Wilcoxon uses ranks of distances and needs symmetry; sign uses only + / −.",'If a question says "symmetric but non-normal", the answer is Wilcoxon.',"Know the check W⁺ + W⁻ = n(n + 1) ÷ 2 to catch ranking mistakes.",'Zero differences are removed before ranking ("N for Test").']},{topic:"3.5.7",title:"One and Two Sample Proportion",pages:"Book pp. 396–404",doc:"book-301-400",pdfPage:99,intro:"Proportion tests are for **attribute data** — accurate or not, defective or not. The **1-proportion test** compares one proportion with a target; the **2-proportion test** compares two proportions, for example before and after an improvement. Attribute data carry less information than continuous data, so these tests need **large samples**.",sections:[{heading:"Attribute data and the roadmap",body:`The book (p. 396): attribute data are **non-normal by definition**, so they have their own roadmap:

- **One sample vs a target** → 1-proportion test.
- **Two samples** → 2-proportion test.
- **Two or more samples / two factors** → chi-square contingency table (3.5.8).

**Sample size depends on the data type** (p. 397):

| | Continuous | Attribute |
|---|---|---|
| Capability | at least 30 | **a lot** |
| Hypothesis test | depends on difference, variation, confidence | **a lot**, depends on difference and confidence |

The book's key reminder: **the smaller the difference you need to detect, the larger the sample must be** — and for proportions the numbers grow very fast.

Minitab paths: *Stat > Power and Sample Size > 1 Proportion / 2 Proportions* for sample size; *Stat > Basic Statistics > 1 Proportion / 2 Proportions* for the test.`},{heading:"The 1-proportion test: worked example",body:`Used to decide whether a process proportion $p$ equals a desired value $p_0$:

$$H_0: p = p_0 \\qquad H_a: p \\ne p_0$$

Normal-approximation statistic (the book calls it an approximation for manual work; Minitab gives an **exact** result):

$$Z = \\dfrac{\\hat{p} - p_0}{\\sqrt{\\dfrac{p_0(1-p_0)}{n}}}$$

**Book example (pp. 398–399).** Shipping accuracy target **99%**. A sample of 500 shipments has 480 accurate:

$$\\hat{p} = \\dfrac{480}{500} = 0.96$$

$$Z = \\dfrac{0.96 - 0.99}{\\sqrt{\\dfrac{0.99 \\times 0.01}{500}}} = \\dfrac{-0.03}{0.00445} = -6.74$$

|Z| is far beyond 1.96. Minitab: **exact 95% CI (0.9389, 0.9754), p = 0.000**. 0.99 is **outside** the CI → **reject $H_0$**. Practical conclusion: we are **not** performing to the 99% accuracy target. (The book's slide says "hypothesized mean" — it means the hypothesised proportion.)`},{heading:"Sample size for proportions grows fast",body:`**1-proportion, target 99%, power 0.9, α = 0.05 (book p. 398):**

| Alternative proportion | 0.95 | 0.96 | 0.97 | 0.98 |
|---|---|---|---|---|
| Sample size | 140 | 221 | 428 | **1,402** |

To tell 98% from 99% you need 1,402 shipments. The sample of 500 was enough only because the real accuracy (96%) was far from 99%.

**Bonus exercise (pp. 399–400).** Your bonus depends on proving accuracy is better than **80%**. To detect 82% vs 80% you need **n = 4,073**. Your data: 1,680 accurate out of 2,000:

$$\\hat{p} = \\dfrac{1{,}680}{2{,}000} = 0.84$$

0.80 lies outside the confidence interval → significant → you get the bonus. The sample of 2,000 was enough because the true improvement (84%) was bigger than the 82% you planned for. The book's joke: either ship a lot of product or improve by more than 2 points.`},{heading:"The 2-proportion test: worked example",body:`Used to decide whether the proportion of one sample differs from another (for example before vs after an improvement):

$$H_0: p_1 - p_2 = 0 \\qquad H_a: p_1 - p_2 \\ne 0$$

Approximate statistic (separate variances, as in the book):

$$Z = \\dfrac{\\hat{p}_1 - \\hat{p}_2}{\\sqrt{\\dfrac{\\hat{p}_1(1-\\hat{p}_1)}{n_1} + \\dfrac{\\hat{p}_2(1-\\hat{p}_2)}{n_2}}}$$

**Book example (pp. 402–403).** Before: 510 of 600 accurate. After: 212 of 225.

$$\\hat{p}_1 = \\dfrac{510}{600} = 0.850 \\qquad \\hat{p}_2 = \\dfrac{212}{225} = 0.942$$

$$Z = \\dfrac{0.850 - 0.942}{\\sqrt{\\dfrac{0.85 \\times 0.15}{600} + \\dfrac{0.942 \\times 0.058}{225}}} = \\dfrac{-0.092}{0.0213} = -4.33$$

Minitab: difference −0.0922, **95% CI (−0.134, −0.050)**, Z = −4.33, **p = 0.000**. The CI excludes 0 → **reject $H_0$**: the improvement made a significant difference in accuracy.`},{heading:"Sample size per group and the Boris & Igor case",body:`**2-proportion sample sizes are per group.** Book (p. 402), power 0.9, α = 0.05:

- 85% → 95% (a 10-point gain): **188 per group**.
- 85% → 90% (a 5-point gain): **918 per group**.

For a more **conservative** estimate: when the null proportion is close to **100%**, use the **smaller** proportion for $p_1$; when it is close to **0**, use the **larger** one.

**Boris and Igor (p. 404).** Requisition errors: Boris 47 of 356, Igor 99 of 571.

$$\\hat{p}_B = \\dfrac{47}{356} = 0.132 \\qquad \\hat{p}_I = \\dfrac{99}{571} = 0.173$$

Minitab: difference −0.041, CI (−0.088, 0.006) **includes 0**, Z = −1.73, **p = 0.084** → **fail to reject $H_0$**. We cannot say who is worse. The book's practical point: the sample is **too small** — about **1,673 requisitions each** would be needed to detect 13% vs 17%. A difference that may matter practically is not yet proven statistically.`}],keyPoints:["Attribute data are non-normal by definition and need large samples.","1-proportion: H₀: p = p₀; Z = (p̂ − p₀) ÷ √(p₀(1 − p₀) ÷ n).","2-proportion: H₀: p₁ − p₂ = 0; sample size is per group.","Reject when the hypothesised value (p₀, or 0 for a difference) is outside the CI, or p < α.","Smaller differences need far larger samples (98% vs 99% → 1,402; 85% → 90% → 918 per group).","Minitab offers normal-approximation and exact methods; the book uses exact.","Boris & Igor: p = 0.084 → fail to reject; sample too small (1,673 each needed)."],examTips:["Expect to compute p̂ = X ÷ n and a Z statistic, then compare with ±1.96.","For a 2-proportion CI, check whether 0 is inside; for a 1-proportion CI, check p₀.","Trap: using a t-test or chi-square for a single proportion vs target.",'If p > α with a practically important gap, the likely answer is "sample size too small".']},{topic:"3.5.8",title:"Chi-Squared (Contingency Tables)",pages:"Book pp. 405–412",doc:"book-401-500",pdfPage:8,intro:"A chi-square contingency-table test compares **several proportions at once** and tests whether two categorical factors are **independent**. It works on **counts**, compares what you observed with what you would expect if nothing were going on, and adds up the differences.",sections:[{heading:"What a contingency table tests",body:`The book (p. 405): contingency tables are used to **compare more than two sample proportions** with each other at the same time. The name comes from the question: is the proportion **contingent upon** (dependent on) the factor used to group the data?

Examples from the book:

- Return proportion by **product line**
- Claim proportion by **customer**
- Defect proportion by **manufacturing line**

Hypotheses:

$$H_0: p_1 = p_2 = p_3 = \\dots = p_n \\qquad H_a: \\text{at least one } p \\text{ is different}$$

Equivalently (book p. 412): $H_0$ — the two classifications are **independent**; $H_a$ — they are associated (dependent).

Rules: the test is for **frequency (count) data**. It works best with **at least 5 observations (expected) in each cell**; if not, **pool cells** by combining categories. Because the data are counts, there is no normality or equal-variance check — the roadmap goes straight from "attribute data, two or more samples" to the chi-square test.`},{heading:"The statistic, expected counts and degrees of freedom",body:`**Observed (O)** = the sample counts in each cell. **Expected (E)** = the count you would expect in each cell if $H_0$ were true:

$$E_{ij} = \\dfrac{F_{\\text{row}} \\times F_{\\text{col}}}{F_{\\text{total}}}$$

The test statistic adds up, over **all cells**:

$$\\chi^2 = \\sum \\dfrac{(O - E)^2}{E}$$

When $H_0$ is true this statistic follows a **chi-square distribution** with

$$\\nu = (r - 1)(c - 1)$$

degrees of freedom (r = rows, c = columns).

**Decision.** For a contingency table **all the risk is in the right-hand tail** (a one-tailed test): a big $\\chi^2$ means observed and expected counts are far apart. Reject $H_0$ if $\\chi^2_{\\text{obs}} > \\chi^2_{\\text{crit}}$, or equivalently if p < α. Critical values to know: df 1 → 3.84; df 2 → **5.99**; df 3 → 7.81 (α = 0.05).`},{heading:"Worked example: Moe, Larry and Curley",body:`**Practical problem (pp. 406–409).** Three order-entry operators; does the defect rate depend on the operator? α = 0.05. The test ran for one day to get at least 5 defects.

| | Moe | Larry | Curley | Total |
|---|---|---|---|---|
| Defective | 5 | 8 | 20 | 33 |
| OK | 20 | 30 | 25 | 75 |
| Total | 25 | 38 | 45 | 108 |

**Expected counts**, for example Curley–Defective:

$$E = \\dfrac{33 \\times 45}{108} = 13.75 \\qquad \\dfrac{(20 - 13.75)^2}{13.75} = 2.84$$

| Expected / contribution | Moe | Larry | Curley |
|---|---|---|---|
| Defective | 7.64 / 0.912 | 11.61 / 1.123 | 13.75 / 2.841 |
| OK | 17.36 / 0.401 | 26.39 / 0.494 | 31.25 / 1.250 |

$$\\chi^2 = 0.912 + 1.123 + 2.841 + 0.401 + 0.494 + 1.250 = 7.02$$

df = (2 − 1)(3 − 1) = 2 → critical value **5.99**. 7.02 > 5.99 (Minitab **p = 0.030**) → **reject $H_0$**. The defect rate is **contingent upon the operator**.`},{heading:"Minitab and reading the result",body:`Path: *Stat > Tables > Chi-Square Test (Two-Way Table in Worksheet)*. Enter **only the observed counts** for each cell — row labels and row/column totals are **not** used.

The output prints, under each observed count, the **expected count** and the **chi-square contribution**, then: **Chi-Sq = 7.021, DF = 2, P-Value = 0.030**.

**Where is the difference?** Look for the **largest contributions**. Curley–Defective (2.84) and Curley–OK (1.25) are the biggest: Curley has many more defects than expected (20 vs 13.75). The book's practical conclusion: "the defect rate for one of these stooges is different."

**Quotations exercise (pp. 411–412).** Lost contracts classified by reason (price, lead time, technology) and complexity (low, medium, high). Chi-square **p = 0.426 > 0.05** → **fail to reject $H_0$**: no evidence that the reason for losing a contract depends on complexity. (The book writes "accept the null hypothesis" — on the exam say **fail to reject**.)`},{heading:"Cautions and links to the rest of Analyze",body:`**Counts, not percentages.** Always enter raw counts. Converting to percentages or rates changes the test. The book adds: if counts are turned into a **rate over time**, a continuous test becomes possible, but choosing the time period (per hour, per day, per month) can be controversial — there must be a **rationale**, not just convenience.

**Cell size.** Expected counts below 5 make the chi-square approximation unreliable. Collect more data or **pool** neighbouring categories.

**What the test does not tell you:** it shows *that* the factors are associated, not *why*, and not that one causes the other. Follow up with process knowledge.

**Same distribution, other uses:** the chi-square distribution also appears in the **1-sample variance test**, in **Mood's median** (a chi-square on above/below counts) and as the reference for **Kruskal-Wallis** and **Friedman**.

**Syllabus wording.** The syllabus lists equal-variance, normality and sample-size work under this topic; for count data the needed "sample size" check is simply **enough data for ≥ 5 expected per cell**.`}],keyPoints:["Contingency table = compares 2+ proportions / tests independence of two categorical factors.","H₀: all proportions equal (factors independent); Hₐ: at least one differs (dependent).","Expected count = row total × column total ÷ grand total.","χ² = Σ (O − E)² ÷ E over all cells; df = (r − 1)(c − 1).","All the risk is in the right tail; critical χ² at α 0.05, df 2 = 5.99.","Works best with ≥ 5 expected per cell; pool cells if needed.","Book example: χ² = 7.02 > 5.99, p = 0.030 → defect rate depends on the operator."],examTips:["Expect to calculate one expected count and one cell contribution, or the degrees of freedom.",'Large χ² / small p → reject independence: "the factors are not independent".',"Trap: using row or column totals (or percentages) as the data in Minitab — use raw cell counts.",'The test is one-tailed (right tail), even though Hₐ just says "different".']}],Ee=Object.freeze(Object.defineProperty({__proto__:null,lessons:Oe},Symbol.toStringTag,{value:"Module"})),De=[{topic:"5.1.1",title:"Control Methods for 5S",pages:"Book pp. 501–513",doc:"book-501-600",pdfPage:4,intro:"In Control, 5S is not a one-time clean-up. It is a **control method**: it keeps the workplace organised so the project gains do not slowly disappear. The book calls 5S the starting point for improvement and the foundation of every other Lean control.",sections:[{heading:"Why Lean tools appear in Control",body:`The book opens the Control phase with **Lean Controls**: more tools from the Lean toolbox to **stabilise** a process. They can be used at any time in a project (before, during or at the end), not only in Control.

The book shows the tools as a **pyramid** that is built from the bottom up:

| Level (bottom → top) | Cannot be sustained without… |
|---|---|
| 1. 5S workplace organisation | — (the base) |
| 2. Visual Factory | 5S |
| 3. Standardized Work | Visual Factory |
| 4. Kaizen | Standardized Work |
| 5. Kanban | Kaizen |

The goal is to **sustain the project by removing muda (waste)**, so the Belt can move to new projects and is not used as a firefighter. Outliers in the project metric often come from different amounts of waste between people, machines or procedures.`},{heading:"The five S words",body:`The book gives the Japanese words but says: focus on the English words, they are easier to remember.

| Step | Japanese | English | Short meaning |
|---|---|---|---|
| 1 | Seiri | **Sorting** | Keep only what the current work needs |
| 2 | Seiton | **Straightening** | A place for everything, everything in its place |
| 3 | Seiso | **Shining** | Clean, and make cleaning part of daily work |
| 4 | Seiketsu | **Standardizing** | Rules that keep the first three S's in place |
| 5 | Shitsuke | **Sustaining** | Discipline: practise until it is a way of life |

**The first three S's are workplace actions. The last two are sustaining actions.** This split is the key to 5S as a *control* method: Standardizing and Sustaining are what stop the area sliding back. The book says the strength of 5S depends on the commitment of employees and the company to maintain it, and recommends starting in a pilot area, then spreading step by step.`},{heading:"Sorting and Straightening in practice",body:`**Sorting.** Start in one area and sort everything. Put each item in one of three groups:
1. **Useful** — keep and store it by how often it is used.
2. **Useless** — dispose of it immediately.
3. **Unknown** — leave it for a **set period of time**; if nobody uses it, remove it.

Items that cannot be removed at once are **tagged** for later removal. Always start with the easiest items.

**ABC storage** (by frequency of use):
- **A** — used daily or several times a day → within arm's reach.
- **B** — used weekly → nearby (shelf, cabinet), not on the work surface.
- **C** — used monthly or quarterly → a remote location a few minutes away.

The workplace should only hold items needed on a daily-to-weekly basis.

**Straightening.** Things used together are stored together. Use labels, tape, floor markings, signs and **shadow outlines**, so a missing tool is seen at once. Shared items go to a central place.`},{heading:"Shining, Standardizing and Sustaining — the control part",body:`**Shining.** Clean everything and find ways to keep it clean. The book stresses **mess prevention**: stop litter and scrap reaching the floor in the first place. A clean workplace makes **abnormal conditions easy to see**. Use a layout map to give each person a cleaning area, which removes any "no man's land".

**Standardizing.** Keep the workplace at a level that makes problems obvious. Orderliness is kept by **visual controls**: signboards, painted lines, colour-coding and standard best methods across the organisation.

**Sustaining.** The discipline and commitment behind all the other steps. Without it the workplace goes back to being dirty and chaotic. Tools: **schedules and checklists**, regular audits, and leaders who keep the habit alive. The book warns that good habits are hard to establish.

So, as a control method, 5S is held in place by **standards + visual controls + checklists/audits + discipline**.`},{heading:"When to use 5S as a control — and an example",body:`The book's summary lessons say the **team should 5S the project area** and start adding Visual Factory indicators. Signs that 5S is needed:
- **Outliers** in the project metric.
- **Loss of initial gains** from the project.
- Declining benefits or dropping process capability.

Also: Standardized Work instructions will not create consistency without an organised (5S) workplace, and Kaizen and Kanban cannot be attempted without it. **Project scope decides how far up the pyramid** you need to go.

**Example (service desk).** After a project cut ticket handling time, results start to drift. The team sorts the shared drive (useful / useless / unknown, with a 30-day hold for unknown files), straightens the knowledge base so each fix has one fixed location, sets a weekly standard check-list, and a team lead audits it every Friday. The audit score and the handling-time chart are posted on the team board — a visual control.`}],keyPoints:["5S = Sorting, Straightening, Shining, Standardizing, Sustaining (Seiri, Seiton, Seiso, Seiketsu, Shitsuke).","First three S’s = workplace actions; last two = sustaining actions.","5S is the base of the Lean pyramid: 5S → Visual Factory → Standardized Work → Kaizen → Kanban.","Sorting groups: useful, useless (remove now), unknown (hold for a set time, then remove).","ABC storage: A daily = arm’s reach, B weekly = nearby, C monthly/quarterly = remote.","Visual controls (signboards, painted lines, colour-coding) maintain Standardizing.","Outliers and loss of initial gains are signs the area needs 5S."],examTips:["Know the order of the S’s and match each English word to its meaning; the exam may give the Japanese word.","Trap: Standardizing is not “writing an SOP for the process” — it is the rules that keep Sort, Straighten and Shine in place.","Trap: the “unknown” items are not thrown away at once; they are held for a set time.","Questions on sustaining ask for discipline, checklists, schedules and audits — not another clean-up campaign.","If asked which Lean tool must come first, the answer is 5S (the foundation)."]},{topic:"5.1.2",title:"Kanban",pages:"Book pp. 502, 511–513",doc:"book-501-600",pdfPage:14,intro:"Kanban is a **pull signal**: a card or an empty container that tells a process to start work or to bring more material. It limits inventory and keeps the flow smooth. The book places it at the **top** of the Lean pyramid, so it only works when all the lower tools are in place.",sections:[{heading:"What Kanban is",body:`The book defines **Kanban** as the Japanese word for a **communication signal or card**, typically a signal to begin work. It is the technique used to **pull** products and material through a Lean system.

Key ideas:
- The signal can be a **small card** or a **physical signal such as an empty container**.
- Kanban carries **production, conveyance and delivery** information.
- In its purest form, **nothing moves** in the facility without a Kanban attached.
- The book calls Kanban the best inventory-control method for attacking several of the **7 wastes** (muda), especially inventory, overproduction and waiting.

**Push vs pull.** In a push system each step produces to a forecast and sends work forward, so inventory piles up. In a pull system a step produces **only when the next step signals a need**. Kanban is that signal, so it caps work-in-process (WIP).`},{heading:"The two types of Kanban",body:`The book names two main categories.

| Type | Other names | Purpose |
|---|---|---|
| **1. Finished-goods Kanban** | Intra-process | Controls production inside a process |
| — Signal Kanban | | Posted at the end of the processing area to **signal production to begin** |
| — P.I.K. (Production Instruction Kanban) | | Finer inventory control: posted **as inventory is depleted**, so only the minimum level is kept |
| **2. Incoming-material Kanban** | **Withdrawal**, inter-process, supplier | Used to get material from a supplying department (internal or external); **regulates WIP** between two processes |

Memory aid: *finished goods* → **make** something (signal, P.I.K.); *incoming material* → **withdraw** or buy something.`},{heading:"Prerequisites and warnings",body:`Kanban is a **building block** on top of the lower levels. The book is very direct: if you do **not** have 5S, Visual Factory, Standardized Work and ongoing Kaizens, **Kanbans cannot succeed**. If you implement Kanban too early it **will backfire** and hurt the process.

Conditions that support a Kanban system:
- Improved **changeover** procedures.
- A relatively **stable demand** cycle.
- A **standard** number of parts per card, kept as small as possible.
- Small variation and **near-zero defects** sent forward.
- **Consistent cycle times** from Standardized Work.
- **Trained** material handlers.

Kanban is **not a quick fix** for large inventory problems, workforce issues, poor planning or fluctuating demand. The book quotes benchmarks of up to **seven years** to run Kanban through a full supply chain. The hard part is keeping the **discipline** of a simple tool.`},{heading:"Sizing a Kanban loop (common formula)",body:`The book gives no formula for the number of cards. The usual textbook formula is:

$$N=\\dfrac{D\\times L\\times(1+S)}{C}$$

- $D$ = demand per time period, $L$ = lead (replenishment) time in the same units, $S$ = safety factor, $C$ = quantity per container (card).

Always **round up**, because a fraction of a card does not exist.

**Worked example.** A repair desk uses 200 spare modules per day. Replenishment takes half a day. Safety factor 10%. Each bin holds 20 modules.

$$N=\\dfrac{200\\times 0.5\\times 1.10}{20}=\\dfrac{110}{20}=5.5\\;\\Rightarrow\\;6\\text{ Kanbans}$$

The maximum inventory in the loop is about $6\\times 20=120$ modules. Fewer cards means less WIP but more risk of running out; that trade-off is why stable demand and short changeovers matter.`},{heading:"Kanban in service and IT work",body:`In offices and IT the same idea appears as a **Kanban board** with **WIP limits** per column. A column with a WIP limit of 5 cannot pull a sixth ticket until one moves on. The empty slot is the signal, exactly like the book's empty container.

**Example.** A provisioning team had 140 open orders and long waiting times. After 5S of the order queue and standard work for each order type, the team set WIP limits (Validate 6, Configure 8, Test 4). New orders are pulled only when a slot frees. Queue time falls because work no longer waits in piles.

Remember the book's ladder: the team first needed an organised queue (5S), visible status (Visual Factory) and agreed steps (Standardized Work). Without them, WIP limits would just hide the chaos.`}],keyPoints:["Kanban = Japanese for signal or card; a signal to begin work.","Kanban is a pull system; the signal can be a card or an empty container.","Type 1 finished-goods (intra-process): Signal Kanban and P.I.K.","Type 2 incoming-material (Withdrawal, inter-process): regulates WIP between two processes.","Kanban sits at the top of the pyramid: it cannot be sustained without Kaizen (and 5S, Visual Factory, Standardized Work).","Premature Kanban will backfire; it is not a quick fix for inventory or demand problems.","Needs stable demand, standard card quantities, low defects, consistent cycle times, trained handlers."],examTips:["Expect “Kanban works best with a ___ system” → pull.","Trap: “Withdrawal Kanban” belongs to incoming material, not finished goods.","Trap: Kanban does not fix fluctuating demand or large inventory problems — the book says it is not a quick fix.","If a question asks what must exist before Kanban, choose the lower pyramid tools (5S, visual factory, standard work, kaizen).","If you calculate the number of cards, round up."]},{topic:"5.1.3",title:"Poka-Yoke (Mistake Proofing)",pages:"Book pp. 522, 557–560",doc:"book-501-600",pdfPage:25,intro:"**Poka-yoke** is Japanese for mistake proofing. It designs the process so that an error **cannot happen**, or is **caught at once** before a defect moves on. The book ranks it as the strongest form of control in the Control phase.",sections:[{heading:"Definition and the idea behind it",body:`People make mistakes: they forget, mix up, misread. Inspection finds defects **after** they are made. Poka-yoke attacks the **error condition** itself, so the defect is never made or never leaves the step.

The book teaches poka-yoke through its **control-effectiveness ranking** (p. 522), using "corrective action" types:
- **Type 1 corrective action = Countermeasure.** A change that **eliminates the error condition**. "The defect will never be created." This is a long-term action in the form of **mistake proofing or design change**. It is the **prevention** use of poka-yoke.
- **Type 2 corrective action = Flag.** A change that **detects** when the error condition has occurred and **shuts down** the equipment so the defect does not move forward. It is the **detection** use of poka-yoke.

So poka-yoke has two faces: **prevention** (best) and **detection** (second best).`},{heading:"Where poka-yoke sits in the control ranking",body:`The book's ranking of controls, from most to least effective:

| Rank | Control | Kind |
|---|---|---|
| 1 | **Type 1 — countermeasure** (prevention poka-yoke, design change) | Defect cannot happen |
| 2 | **Type 2 — flag** (detection poka-yoke, auto shut-down) | Defect cannot move on |
| 3 | SPC on X's with trained, **empowered** staff | Catches special causes |
| 4 | **Type 3 — inspection** (containment: audits, 100% inspection) | Short-term, finds defects |
| 5 | SOP alone | Not sustainable |
| — | SPC without proper use | "Wall paper" |

The Control-plan pages say the same thing in another form: improvements that **remove the root cause** rank above those that **monitor or flag**, which rank above **inspection**, which ranks above **training people** not to make defects (p. 557). The Improvement Selection Matrix gives impact 7 to "X's are removed from impacting the output" and only 1 to "personnel are trained" (p. 560).`},{heading:"Common poka-yoke methods (general practice)",body:`The book does not list device types. Standard Lean practice uses three methods to sense an error:
- **Contact method** — shape, size or a sensor checks a physical feature (a plug that fits only one way).
- **Fixed-value method** — a set number of actions or parts must be completed (a kit tray with exactly 6 slots; the job cannot close until all are empty).
- **Motion-step method** — steps must happen in the right order (a form will not submit until mandatory fields are valid).

And two kinds of response:
- **Control (shut-down)** — the process stops: Type 2 in the book's language.
- **Warning** — a light or sound alerts the person; weaker, because a person can ignore it.

Service examples: drop-down lists instead of free text, format validation of account numbers, a system that blocks closing a ticket without a resolution code, auto-fill from the customer record.`},{heading:"How to choose and an example",body:`**Decision steps:**
1. Use the FMEA to find the failure modes with the **highest risk** (RPN).
2. Ask: can the error condition be **removed by design** (Type 1)? If yes, do that.
3. If not, can the error be **detected at once and the process stopped** (Type 2)?
4. Only then fall back on SPC, inspection or procedures.
5. Record the device in the **control plan** and verify it works (test it on purpose).

**Example (billing).** Wrong tariff codes cause 3% of invoices to be re-issued. Option A: train billing staff again (impact 1). Option B: a weekly audit of 100 invoices (inspection, Type 3). Option C: the order system shows only the tariffs valid for the customer's product, so a wrong code cannot be chosen (Type 1). The team chooses C. After the change the FMEA occurrence score drops, and the RPN is recalculated in the control plan.`}],keyPoints:["Poka-yoke = mistake proofing (Japanese).","Type 1 corrective action (countermeasure) = prevention poka-yoke: the defect is never created — the most effective control.","Type 2 corrective action (flag) = detection poka-yoke: detects the error and shuts down so the defect does not move forward.","Ranking: Type 1 > Type 2 > SPC with empowered staff > Type 3 inspection > SOP.","Remove root cause > monitor/flag > inspect > train people.","Mistake proofing and robust design are examples of defect prevention."],examTips:["The exam likes “Which is the most effective control?” → mistake proofing that prevents the error (Type 1).","Trap: a warning light or alarm is weaker than a shut-down; inspection is not poka-yoke prevention.","Trap: training and SOPs are the weakest controls, even though they are common.","Know that detection poka-yoke stops the defect moving forward; it does not stop it being made."]},{topic:"5.2.1",title:"Data Collection for SPC",pages:"Book pp. 516–519, 523–531",doc:"book-501-600",pdfPage:19,intro:"A control chart is only as good as the data behind it. This topic covers **what** to chart (inputs or outputs), **how** to sample (rational subgroups, no bias), **how often**, and **which chart** to pick. Most charting mistakes in practice are data-collection mistakes.",sections:[{heading:"SPC vs SPM — what to chart",body:`The book reminds you of $Y=f(X)$: you can only **control an output by controlling the inputs** that affect it.

- Charting a critical **input (X)** = **SPC**, Statistical Process **Control**.
- Charting an **output (Y)** = **SPM**, Statistical Process **Monitoring**.

When you find the vital few X's, **first consider SPC on the X's** to achieve the desired Y. Charts on outputs alone often disappointed, because they show the problem only after it happens.

Control charts are also used to find **baseline** performance, evaluate **measurement systems**, compare processes, and compare **before and after** a change.

SPC detects special-cause variation and tells you the process is **out of control — but not why**. A process **in control is stable and predictable, not necessarily capable**: specification limits are not part of a control chart.`},{heading:"Sampling without bias",body:`**Population** = everything made or to be made; **sample** = the items actually measured. The sample must represent the population.

The book's rules:
- The process must **run normally** while you sample. Any special treatment or bias makes the chart **invalid**.
- Avoid biased samples: not only the first shift, not only one vendor's material, not only just before lunch.
- If several machines, operators or streams make the same output, use **separate charts for each stream**.
- At the start, **take extra samples**; reduce the rate once the process stays in control.

In a stable process the points scatter randomly around the average with no trends or shifts. That is **common-cause** variation, and you should **not adjust** the process for it. Special-cause variation always needs investigation and action.`},{heading:"Rational subgroups",body:`A **rational subgroup** is a small sample of items made under **very similar conditions in a short time**. The book gives:
- Size usually **3 to 5 units** (variables data typically 3–12; 3, 5 and 10 are most common because they were easy to calculate by hand).
- Example: a machine drills 30 holes a minute → a good subgroup is **4 consecutively drilled holes**.
- **Five consecutive items** from one machine, same set-up, material and operator = rational. **Five items made at the same time on different machines = not rational.**

Why it matters: the **spread inside** a subgroup sets the control limits. Keep only common-cause variation inside subgroups, so shifts **between** subgroups show up as signals. If you mix sources (machines, product types, shifts) inside a subgroup, the limits become too wide and real causes are **buried**. The book's quote-delivery example: putting product categories inside subgroups hides them as special causes.

The most common Xbar-R error is wrong subgrouping.`},{heading:"How often to sample",body:`**Sampling frequency** balances the **cost of sampling and testing** against the **cost of missing a shift**. Decide the subgroup size first; then use process knowledge to set the frequency.

Book guidance:
- If a shift is missed because sampling is too rare, **the customer suffers**.
- Given the choice, most people take **smaller subgroups more often** rather than large ones rarely.
- If unsure, **sample more often**, confirm shifts are detected, then reduce.
- Rule of thumb: sample **at least 10 times more often** than out-of-control conditions occur.

**Example.** A call-centre metric goes out of control about **twice a month**. Ten times that rate is

$$\\dfrac{2\\times 10}{1\\text{ month}}=20\\text{ samples per month}$$

so roughly one subgroup per working day (about 22 days). A plan of one subgroup per week (about 4 a month) would be too rare.

For P charts the book recommends **at least 20 subgroups** before calculating control limits.`},{heading:"Choosing the chart",body:`The book's selection tree starts with the **type of data**, then the objective.

**Continuous (variables) data — by subgroup size:**

| Subgroup size | Chart |
|---|---|
| 1 | **I-MR** |
| 2–5 | **Xbar-R** |
| 10 or more | **Xbar-S** |
| Special cases (small shifts) | **CuSum**, **EWMA** |

**Attribute data:**

| Counting… | Constant sample size | Variable sample size |
|---|---|---|
| **Defects** (flaws; a unit can have many) | **C** | **U** |
| **Defectives** (whole unit good/bad) | **NP** | **P** |

A **defective** is a whole unit that fails acceptance, whatever its number of defects. A **defect** is one failed criterion. Prefer **continuous data** when you can: it carries more information.`},{heading:"The 13-step control chart cookbook",body:`The book lists the steps to set up a chart:
1. Select the characteristic (critical X or CTQ).
2. Decide the purpose of the chart.
3. Select the data-collection points.
4. Set the basis for subgrouping (for Y's).
5. Select the type of chart.
6. Decide the measurement method/criteria.
7. Set the sampling interval/frequency.
8. Decide the sample size.
9. Set the basis for calculating control limits.
10. Set up forms/software for charting.
11. Set up forms/software for data collection.
12. Write instructions for all phases.
13. Train the people.

Note the order: subgroups and chart type **before** frequency and sample size; training last but essential. Limits come from **past data**, so once set they are frozen and new points are plotted against them.`}],keyPoints:["SPC = charting inputs (X’s); SPM = charting outputs (Y’s). Control the Y by controlling the X’s.","Sample while the process runs normally; bias makes the chart invalid.","Rational subgroup = items made under very similar conditions in a short time (often 3–5 consecutive units).","Items made at the same time on different machines are NOT a rational subgroup; use a separate chart per stream.","Sample at least 10 times more often than out-of-control events; when unsure, sample more often.","Chart choice: data type first, then subgroup size (1 → I-MR, 2–5 → Xbar-R, 10+ → Xbar-S).","Defects → C (constant n) / U (variable n); defectives → NP (constant n) / P (variable n)."],examTips:["A frequent item: “What is a rational subgroup?” → similar conditions, short time, consecutive units.","Trap: “five parts, one from each of five machines at the same time” looks neat but is not rational.","Chart-selection questions hide two clues: data type (defect vs defective vs continuous) and whether n is constant.","Trap: a stable (in-control) process is not automatically capable — specs are not on the chart."]},{topic:"5.2.2",title:"I-MR Chart",pages:"Book pp. 518, 530–531, 538",doc:"book-501-600",pdfPage:21,intro:"The **I-MR chart** (Individuals and Moving Range) is used when each data point is a **single value** — subgroup size one. The I chart tracks the process level; the MR chart tracks short-term variation between neighbouring points. It is the most common chart for inputs and for slow or costly data.",sections:[{heading:"When to use it",body:`Use the I-MR when each measurement represents **one batch** or one period. The book's examples:
- **Destructive testing** (you cannot test many units).
- **Inventory turns** or **monthly revenue figures** (one number per period).
- **Chemical tests** of a large, well-mixed container.
- Measurements that are **widely spaced in time**.

The selection table adds: low production volume, long cycle time, a homogeneous sample that represents the whole batch, or costly sampling where subgroups are not wanted. It is **used for SPC on most inputs**.

Trade-off: because it uses single values, the I chart is **less sensitive** than an Xbar chart, and its limits are **wider**. Showing both charts together tracks level and variation at the same time.`},{heading:"How the chart is built",body:`**Individuals chart.** The centre line is the average of all $k$ values:

$$\\bar{X}=\\dfrac{\\sum x_i}{k}$$

**Moving range.** Each $MR$ is the absolute difference between two **consecutive** points, $MR_i=|x_i-x_{i-1}|$. With $k$ points there are $k-1$ moving ranges.

$$\\overline{MR}=\\dfrac{\\sum MR_i}{k-1}$$

**Limits** (moving range of 2 points, so $n=2$: $E_2=2.66$, $D_4=3.267$, $D_3=0$):

$$UCL_X=\\bar{X}+E_2\\overline{MR}\\qquad LCL_X=\\bar{X}-E_2\\overline{MR}$$

$$UCL_{MR}=D_4\\overline{MR}\\qquad LCL_{MR}=D_3\\overline{MR}=0$$

$E_2=2.66$ comes from $3\\div d_2$ with $d_2=1.128$, so the short-term sigma estimate is

$$\\hat{\\sigma}=\\dfrac{\\overline{MR}}{d_2}=\\dfrac{\\overline{MR}}{1.128}$$

So the I-chart limits are really $\\bar{X}\\pm 3\\hat{\\sigma}$. The sigma comes from the **short-term** variation between neighbours, not from the overall standard deviation of all the data. This is deliberate: if the process drifts, the overall standard deviation grows and would hide the drift, while the moving range stays small. The MR chart has no lower limit because, for a range of two points, $D_3$ is zero (the book notes the MR lower limit does not apply below a sample size of 7).`},{heading:"Worked example — small data set",body:`Five daily values of server restart time (min): 10, 12, 11, 15, 13.

**Step 1 — centre line.**
$$\\bar{X}=\\dfrac{10+12+11+15+13}{5}=\\dfrac{61}{5}=12.2$$

**Step 2 — moving ranges:** |12−10| = 2, |11−12| = 1, |15−11| = 4, |13−15| = 2.
$$\\overline{MR}=\\dfrac{2+1+4+2}{4}=\\dfrac{9}{4}=2.25$$

**Step 3 — I chart limits.** $2.66\\times 2.25=5.985$
- UCL = 12.2 + 5.985 = **18.19**
- LCL = 12.2 − 5.985 = **6.22**

**Step 4 — MR chart.** UCL = 3.267 × 2.25 = **7.35**; LCL = 0.

All points lie inside the limits, and no MR is above 7.35, so no special cause is shown. (In practice you need far more than five points — the book recommends about 20+ before trusting limits.)`},{heading:"Reading the book’s example",body:`The book's I-MR output (p. 518) shows $\\bar{X}=219.89$ and $\\overline{MR}=2.341$ for about 110 observations.

Check the limits by hand:
$$UCL_X=219.89+2.66\\times 2.341=219.89+6.23=226.12$$
$$LCL_X=219.89-6.23=213.66\\ (\\text{book }213.67,\\text{ rounding})$$
$$UCL_{MR}=3.267\\times 2.341=7.65$$

And the process sigma estimate:
$$\\hat{\\sigma}=\\dfrac{2.341}{1.128}=2.08$$

**How to read it.** First look at the **MR chart**: if short-term variation is unstable, the I-chart limits are not reliable. Then look at the I chart for points beyond the limits and for patterns. Only four tests apply to the MR chart (one point beyond 3σ, 6 trending, 14 alternating, 9 on one side); the zone tests are for the I chart.`}],keyPoints:["I-MR = subgroup size 1; one value per batch or period.","Uses: destructive tests, monthly figures, batch chemistry, widely spaced data, most inputs.","MR = |difference between consecutive points|; k points give k − 1 moving ranges.","UCL/LCL = X̄ ± 2.66·MR̄ (E₂ = 2.66); MR chart UCL = 3.267·MR̄, LCL = 0.","σ̂ = MR̄ divided by d₂ = 1.128 (moving range of two points).","Less sensitive than Xbar-R; limits are wider."],examTips:["Typical calculation: given X̄ and MR̄, find UCL with 2.66 — do not use A₂ or 3·MR̄.","Trap: dividing the sum of moving ranges by k instead of k − 1.","Trap: using the overall standard deviation (from all data) instead of the moving-range estimate for the limits.","Scenario clue for I-MR: “one measurement per day/batch”, “destructive test”, “monthly report”."]},{topic:"5.2.3",title:"Xbar-R Chart",pages:"Book pp. 519, 530–531, 538, 548–552",doc:"book-501-600",pdfPage:22,intro:"The **Xbar-R chart** is a matched pair: the Xbar chart plots **subgroup averages** (process level) and the R chart plots **subgroup ranges** (short-term spread). It is used for continuous data in small subgroups, usually 2–5 units, and is more sensitive than an I-MR chart.",sections:[{heading:"When to use it",body:`Use Xbar-R when each sample is a **subgroup** of continuous measurements, not a single value. The selection tree gives **subgroup size 2–5**. The selection table says it suits **higher-volume** production and lets you view **mean and variability together**.

Why averages? An average of several units varies less than single units, so the Xbar chart has **tighter limits** and catches shifts in the mean **faster** — the book says it gives **greater sensitivity** and insight into short-term variation.

The condition is **rational subgrouping**. The book warns that failure to form rational subgroups makes Xbar-R charts **incorrect**, and that this is the **most common error**.

Track level and spread separately because they usually need **different corrective actions**.`},{heading:"Formulas",body:`For $k$ subgroups of size $n$:

$$\\bar{\\bar{X}}=\\dfrac{\\sum \\bar{x}_i}{k}\\qquad \\bar{R}=\\dfrac{\\sum R_i}{k}$$

where each $R_i$ = largest − smallest value in subgroup $i$.

**Xbar chart limits:**
$$UCL_{\\bar X}=\\bar{\\bar{X}}+A_2\\bar{R}\\qquad LCL_{\\bar X}=\\bar{\\bar{X}}-A_2\\bar{R}$$

**R chart limits:**
$$UCL_R=D_4\\bar{R}\\qquad LCL_R=D_3\\bar{R}$$

Constants depend on $n$ (from the exam reference table):

| n | A₂ | D₃ | D₄ | d₂ |
|---|---|---|---|---|
| 2 | 1.880 | 0 | 3.267 | 1.128 |
| 3 | 1.023 | 0 | 2.574 | 1.693 |
| 4 | 0.729 | 0 | 2.282 | 2.059 |
| 5 | 0.577 | 0 | 2.114 | 2.326 |

Short-term sigma: $$\\hat{\\sigma}=\\dfrac{\\bar{R}}{d_2}$$`},{heading:"Worked example — the book’s hole diameters",body:`A job shop drills holes on **five drill presses**. Every hour it takes one hole from each press, so $n=5$. Minitab gives $\\bar{\\bar{X}}=26.33$ and $\\bar{R}=11.69$ (pp. 548–551).

**Xbar limits** ($A_2=0.577$):
$$A_2\\bar{R}=0.577\\times 11.69=6.745$$
- UCL = 26.33 + 6.745 = **33.07**
- LCL = 26.33 − 6.745 = **19.59**

**R limits** ($D_4=2.114$, $D_3=0$):
- UCL = 2.114 × 11.69 = **24.71** (book 24.72)
- LCL = 0

These match the book's output. The book selects Xbar-R here because the data are continuous, in subgroups, and small shifts are not of interest.

Note: the book's subgroup is taken **across five presses** and assumes little difference between them. In the rational-subgroup section it warns that items from different machines are normally **not** a rational subgroup — so only accept this when the machines are known to behave the same.`},{heading:"How to read the pair",body:`**Step 1 — R chart first.** The book says the R chart **must be in control** before you interpret the Xbar chart, because the Xbar limits are built from $\\bar{R}$. If the R chart is out of control, the Xbar limits are wrong and may give **false** signals.

**Step 2 — Xbar chart.** Look for points beyond the limits and the run tests (9 on one side, 6 trending, 2 of 3 in zone A, etc.).

**Step 3 — monitor.** For new data, enter the historical mean and sigma in Minitab (Options > Parameters) so the limits stay fixed. In the book's example the next two hours are added and the limits stay **26.33 / 33.07 / 19.59** — no special cause, so **no action**.

The book's other output (p. 519) shows $\\bar{\\bar{X}}=221.13$, $\\bar{R}=8.03$: $0.577\\times 8.03=4.63$ gives UCL 225.76 and LCL 216.50 — again $n=5$.`}],keyPoints:["Xbar-R: continuous data, subgroups of 2–5 (rational subgroups).","Xbar chart = process level; R chart = within-subgroup spread; use them as a matched pair.","UCL/LCL = X̿ ± A₂R̄; R chart UCL = D₄R̄, LCL = D₃R̄ (0 for n ≤ 6).","For n = 5: A₂ = 0.577, D₄ = 2.114, D₃ = 0, d₂ = 2.326.","Read the R chart first; if it is out of control, the Xbar limits are not valid.","More sensitive than I-MR; the most common error is poor subgrouping."],examTips:["Calculation items give X̿, R̄ and n — pick A₂ for that n from the reference table.","Trap: using D₄ on the Xbar chart or A₂ on the R chart.","Trap: “interpret the Xbar chart first” — no, the range chart comes first.","Trap: putting specification limits on the chart; limits come from the data (voice of the process)."]},{topic:"5.2.4",title:"U Chart",pages:"Book pp. 520, 530–531, 540–541",doc:"book-501-600",pdfPage:23,intro:"The **U chart** tracks **defects per unit** when the number of units inspected can **change** from sample to sample. Each unit can have several defects. Its control limits move with the sample size: bigger samples give tighter limits.",sections:[{heading:"Defects, units and when to use U",body:`C and U charts track **defects** (flaws, errors). One unit can contain **more than one** defect. The book says a U chart can do everything a C chart can.

The **unit** (search area) is whatever you define: a page (typing errors), a truck door (paint blemishes), a claim form. In the book's example a hospital claim form has **13 fields**; each blank or wrong field is a **defect**, and the hospital plots defects per form for each day's claims.

| Chart | Plots | Sample size |
|---|---|---|
| **C** | number of defects per subgroup | must be **constant** |
| **U** | defects **per unit** | may **vary** |

So: **defects + variable sample size → U chart.** The U chart's limits are **not uniform**; they change with each sample, like the P chart.`},{heading:"Formulas",body:`For each subgroup, divide the defects counted ($c_i$) by the units inspected ($n_i$):

$$u_i=\\dfrac{c_i}{n_i}$$

**Centre line** (book p. 540):

$$\\bar{u}=\\dfrac{\\text{total defects}}{\\text{total units inspected}}$$

**Limits** for subgroup $i$:

$$UCL_i=\\bar{u}+3\\sqrt{\\dfrac{\\bar{u}}{n_i}}\\qquad LCL_i=\\bar{u}-3\\sqrt{\\dfrac{\\bar{u}}{n_i}}$$

If the LCL is negative, set it to **0** (a count cannot be below zero).

**C chart** (constant size, book p. 541):

$$\\bar{c}=\\dfrac{\\text{total defects}}{\\text{number of subgroups}}\\qquad UCL=\\bar{c}+3\\sqrt{\\bar{c}}$$

Example: $\\bar{c}=4$ gives UCL $=4+3\\times 2=10$ and LCL $=4-6<0\\Rightarrow 0$.

Why the square root of $\\bar{u}$? Defect counts follow the **Poisson** distribution, where the variance equals the mean. Dividing by $n_i$ turns the count into a rate, so a larger sample gives a smaller spread. Always use the **total** defects and **total** units for the centre line; do not average the daily rates, because days with more units must carry more weight.`},{heading:"Worked example — claim forms",body:`The book's U chart (p. 520) has centre line $\\bar{u}=0.0546$ defects per form. Suppose one day **100 forms** were checked and **14 defects** found.

**Step 1 — plotted point.**
$$u=\\dfrac{14}{100}=0.14$$

**Step 2 — limits for n = 100.**
$$3\\sqrt{\\dfrac{0.0546}{100}}=3\\times 0.02337=0.0701$$
UCL = 0.0546 + 0.0701 = **0.1247**; LCL = 0.0546 − 0.0701 < 0 → **0**.

**Step 3 — decide.** 0.14 > 0.1247 → **out of control** (special cause). Investigate that day.

**Same rate, bigger sample.** On a day with **150 forms**:
$$3\\sqrt{\\dfrac{0.0546}{150}}=3\\times 0.01908=0.0572$$
UCL = **0.1118**. The limit is tighter because a larger sample gives a more precise rate. This is why U-chart limits look like steps.`},{heading:"Reading and procedure",body:`The book's general procedure for a U chart:
1. Decide the purpose.
2. Choose the data-collection point.
3. Set the basis for subgrouping.
4. Set the sampling interval and sample size.
5. Prepare forms and instructions.
6. Collect and record data.
7. **Count the nonconformities** in each subgroup.
8. Enter into software.
9. Interpret with other information and act if needed.

When reading: compare each point with **its own** limits. A point can be above the line on one day and inside it on another with the same $u$, because $n$ differs. Attribute charts use the four basic tests (beyond 3σ, 9 on one side, 6 trending, 14 alternating).`}],keyPoints:["U chart = defects per unit; sample size can vary.","C chart = count of defects; sample size must be constant.","ū = total defects divided by total units inspected.","Limits depend on ū and each subgroup’s nᵢ, so they change with every subgroup; negative LCL → 0.","Larger n → narrower limits.","A defect is one flaw; a unit can have many (unlike a defective)."],examTips:["Key scenario words: “errors per form/page/order” with “the number checked varies” → U chart.","Trap: averaging the daily u values instead of total defects ÷ total units.","Trap: choosing P because sample size varies — P is for defectives (good/bad units), not defects.","Inside the square root use each subgroup’s nᵢ, not the number of subgroups."]},{topic:"5.2.5",title:"P Chart",pages:"Book pp. 521, 530–531, 539, 544–548",doc:"book-501-600",pdfPage:24,intro:"The **P chart** tracks the **proportion of defective units** — units that are simply good or bad. Sample sizes may differ between subgroups. The book calls it the **most common** attribute chart, and its centre line is also the process capability (the average defective rate).",sections:[{heading:"When to use it",body:`NP and P charts track **defectives**: each item is good or bad, pass or fail, accept or reject. The book says a P chart can do everything an NP chart can.

Use the P chart when the data are a **percentage** and the **sample size may change**. Book examples: patients arriving late for dental appointments each day; forms needing rework each day.

Input: for each subgroup, the **number defective** (an integer) and the **sample size**.

- The **centre line** is the average proportion defective — the book says it is also your **process capability** for that attribute.
- The selection table says P charts usually have samples **larger than 50**.
- The book recommends **at least 20 samples** to calculate the limits.
- With unequal sample sizes, the limits look **uneven**.`},{heading:"Formulas",body:`For each subgroup: $$p_i=\\dfrac{\\text{defectives}_i}{n_i}$$

**Centre line** (book p. 539):
$$\\bar{p}=\\dfrac{\\text{total number of defective items}}{\\text{total number of items inspected}}$$

**Limits:**
$$UCL_i=\\bar{p}+3\\sqrt{\\dfrac{\\bar{p}(1-\\bar{p})}{n_i}}\\qquad LCL_i=\\bar{p}-3\\sqrt{\\dfrac{\\bar{p}(1-\\bar{p})}{n_i}}$$

The limits are **equidistant** from $\\bar{p}$ unless they hit the natural limit of 0 or 1 (0% or 100%). A negative LCL is set to 0. Because the limits depend on $n_i$, they vary from sample to sample.

The square-root part is the **standard error** of a proportion from the **binomial** distribution: each unit is either defective or not. The term $\\bar{p}(1-\\bar{p})$ is largest when $\\bar{p}=0.5$ and small when $\\bar{p}$ is near 0 or 1. As with the U chart, the centre line uses the **totals**, so large samples count more than small ones. Plot each $p_i$ against its own limits.`},{heading:"Worked example — the book’s paycheck rework",body:`A project aims to cut paycheck rework below 25%. For 20 weeks, 250 paychecks a week were checked. Minitab gives $\\bar{p}=0.2038$ (20.38% defective).

**Step 1 — standard error.**
$$\\sqrt{\\dfrac{0.2038\\times 0.7962}{250}}=\\sqrt{\\dfrac{0.16227}{250}}=\\sqrt{0.000649}=0.02548$$

**Step 2 — limits.** $3\\times 0.02548=0.0764$
- UCL = 0.2038 + 0.0764 = **0.2802** (28.0%)
- LCL = 0.2038 − 0.0764 = **0.1274** (12.7%)

These match the book. No special causes appeared in the first 20 weeks.

**Step 3 — monitor new weeks** (limits frozen). Defectives were 61, 64 and 77:
$$\\dfrac{61}{250}=0.244\\qquad \\dfrac{64}{250}=0.256\\qquad \\dfrac{77}{250}=0.308$$

0.308 > 0.2802 → **special cause** in week 23. The team follows the **OCAP**.`},{heading:"After the signal",body:`The book continues the example (pp. 547–548):
- When monitoring new data, enter the **historical p̄** under Options > Parameters/Estimate so Minitab does **not** recalculate the limits automatically. Recalculation is a separate, deliberate step (step 9).
- Because of the special cause, the team refers to the **OCAP**: which root causes to investigate and what actions bring the process back in control.
- After the corrective action, **wait for the next sample**. If it is back in control, **make no more changes** — even if the next point is above the centre line.
- If process changes are documented after the project, **recalculate** the limits.

Also note the book's remark: **specifications were never discussed**. The 25% goal is not drawn on the P chart; the limits come from the process data.`}],keyPoints:["P chart = proportion defective; sample size may vary.","p̄ = total defectives divided by total inspected (not the average of the pᵢ values).","Limits = p̄ ± 3 standard errors, where the standard error uses p̄(1 − p̄) and each nᵢ; negative LCL → 0.","Centre line = average defective rate = process capability for that attribute.","Use at least 20 subgroups to set limits; samples usually > 50.","The most common attribute chart; can do everything an NP chart can."],examTips:["Scenario words: “% late”, “proportion rejected”, “number of forms each day differs” → P chart.","Trap: using the U-chart formula (no 1 − p̄ term) or forgetting (1 − p̄).","Trap: computing limits with the total of all units instead of the subgroup nᵢ.","Trap: drawing the customer target (spec) on the chart as a control limit.","Be ready to convert a count to a proportion before comparing with the UCL."]},{topic:"5.2.6",title:"NP Chart",pages:"Book pp. 521, 530–531, 540",doc:"book-501-600",pdfPage:24,intro:"The **NP chart** plots the **number of defective units** in each subgroup. It is the count version of the P chart and is used when the **sample size is constant**, so the counts can be compared directly. Operators often find counts easier than proportions.",sections:[{heading:"When to use it",body:`NP and P charts both track **defectives** (whole units that are good or bad).

| Chart | Plots | Sample size |
|---|---|---|
| **NP** | **number** of defective units | **constant** |
| **P** | **proportion** defective | may vary |

The book's selection table: nP tracks the number of defective units per subgroup; sample size is **usually constant** and usually **greater than 50**.

Why constant $n$? A count of 10 defectives means something different in a sample of 100 than in a sample of 500. Only when $n$ is fixed can counts be compared fairly. If $n$ varies, use a **P chart**.

Contrast with C: C also needs a constant sample size, but it counts **defects**, not defective units.`},{heading:"Formulas",body:`**Centre line** (book p. 540):
$$n\\bar{p}=\\dfrac{\\text{total number of defective items}}{\\text{total number of subgroups}}$$

and the average proportion is
$$\\bar{p}=\\dfrac{n\\bar{p}}{n}$$

**Limits:**
$$UCL=n\\bar{p}+3\\sqrt{n\\bar{p}(1-\\bar{p})}\\qquad LCL=n\\bar{p}-3\\sqrt{n\\bar{p}(1-\\bar{p})}$$

Negative LCL → 0.

The NP limits are simply the P-chart limits multiplied by $n$. So an NP chart and a P chart on the same constant-$n$ data give **the same signals**.

The book notes that the centre line and limits are a function of sample size. That is why the sample size must stay **constant**: if $n$ changed, the centre line itself would move from point to point and the chart would be hard to read. Software such as Minitab asks for the defectives column and the (fixed) subgroup size, then draws the chart.`},{heading:"Worked example — paychecks as counts",body:`Use the book's paycheck data as an NP chart: $n=250$ every week, $\\bar{p}=0.2038$.

**Step 1 — centre line.**
$$n\\bar{p}=250\\times 0.2038=50.95\\text{ defective paychecks per week}$$

**Step 2 — spread.**
$$\\sqrt{50.95\\times(1-0.2038)}=\\sqrt{50.95\\times 0.7962}=\\sqrt{40.57}=6.369$$

**Step 3 — limits.** $3\\times 6.369=19.11$
- UCL = 50.95 + 19.11 = **70.06**
- LCL = 50.95 − 19.11 = **31.84**

**Step 4 — new weeks** 61, 64, 77: 61 and 64 are inside; **77 > 70.06 → special cause**.

Check against the P chart: $70.06\\div 250=0.2802$ — the same UCL in proportion form. Same data, same signal.`},{heading:"Reading and choosing between NP and P",body:`**Reading.** Plot each count against the fixed limits. Use the four tests that apply to attribute data: a point beyond 3σ, 9 points on one side, 6 points trending, 14 alternating. A count far **below** the centre line can mean a real improvement — or a measurement problem (inspectors missed defectives). Investigate both directions.

**Choosing.** Ask two questions:
1. Am I counting **defective units** (yes/no per unit) or **defects** (many per unit)? Defective → NP or P.
2. Is the **sample size constant**? Yes → NP; no → P.

**Example.** A test lab checks exactly 200 SIM cards per lot and records how many fail activation. Defective units, constant $n$ → **NP chart**. If the lot size changed every day, the lab would switch to a **P chart**.`}],keyPoints:["NP chart = number of defective units per subgroup; needs constant n.","np̄ = total defectives divided by the number of subgroups.","Limits = np̄ ± 3√(np̄(1 − p̄)); negative LCL → 0.","NP limits = P limits × n; same signals on constant-n data.","Variable n → use P instead; defects (not defectives) → C or U."],examTips:["Scenario words: “number of rejected units”, “same sample size every day” → NP.","Trap: using total defectives divided by total units for the NP centre line — that gives p̄, not np̄.","Trap: forgetting (1 − p̄) inside the root — that is the C-chart formula.","Trap: choosing C because n is constant — C is for defects, NP for defectives."]},{topic:"5.2.7",title:"Xbar-S Chart",pages:"Book pp. 530–531, 539",doc:"book-501-600",pdfPage:33,intro:"The **Xbar-S chart** works like Xbar-R, but it measures spread with the **subgroup standard deviation (S)** instead of the range. It is used for **larger subgroups (about 10 or more)**, where the range wastes information and is upset by outliers.",sections:[{heading:"When to use it",body:`The book's selection tree: continuous data with **subgroup size 10+ → Xbar-S** (mean and standard deviation). For 2–5 use Xbar-R.

Why change from R to S?
- The **range uses only two values** (largest and smallest). With 10 or more values it throws away most of the information.
- The book notes that **outliers can cause issues with range charts**, so S charts are used if that is a concern.
- S uses every value in the subgroup, so it estimates sigma more precisely for large $n$.

Like Xbar-R, the two charts are a **pair**: Xbar for level, S for spread. **Read the S chart first** — if variation is out of control, the Xbar limits are not valid. Only the four basic tests apply to the S chart.`},{heading:"Formulas",body:`For $k$ subgroups of size $n$ (book p. 539):

$$\\bar{\\bar{X}}=\\dfrac{\\sum \\bar{x}_i}{k}\\qquad \\bar{s}=\\dfrac{\\sum s_i}{k}$$

where $s_i$ is the sample standard deviation of subgroup $i$ (divide by $n-1$).

**Xbar chart:**
$$UCL_{\\bar X}=\\bar{\\bar{X}}+A_3\\bar{s}\\qquad LCL_{\\bar X}=\\bar{\\bar{X}}-A_3\\bar{s}$$

**S chart:**
$$UCL_S=B_4\\bar{s}\\qquad LCL_S=B_3\\bar{s}$$

Constants vary with $n$ (exam reference table), for example:

| n | A₃ | B₃ | B₄ | c₄ |
|---|---|---|---|---|
| 8 | 1.099 | 0.185 | 1.815 | 0.9650 |
| 10 | 0.975 | 0.284 | 1.716 | 0.9727 |
| 15 | 0.789 | 0.428 | 1.572 | 0.9823 |

Sigma estimate: $$\\hat{\\sigma}=\\dfrac{\\bar{s}}{c_4}$$`},{heading:"Worked example",body:`A network team measures latency on **10 test calls** every hour ($n=10$). After 25 hours: $\\bar{\\bar{X}}=50.0$ ms and $\\bar{s}=2.0$ ms.

**Xbar chart** ($A_3=0.975$):
$$A_3\\bar{s}=0.975\\times 2.0=1.95$$
- UCL = 50.0 + 1.95 = **51.95 ms**
- LCL = 50.0 − 1.95 = **48.05 ms**

**S chart** ($B_4=1.716$, $B_3=0.284$):
- UCL = 1.716 × 2.0 = **3.43 ms**
- LCL = 0.284 × 2.0 = **0.57 ms**

**Sigma estimate:**
$$\\hat{\\sigma}=\\dfrac{2.0}{0.9727}=2.06\\text{ ms}$$

Note the S chart has a **positive LCL** for $n=10$. A point **below** it means unusually low variation — maybe a real improvement, or a measuring problem (for example, the same value copied). Either way, investigate.`},{heading:"Xbar-S vs Xbar-R — quick decision",body:`| Question | Xbar-R | Xbar-S |
|---|---|---|
| Subgroup size | 2–5 (book) | 10+ (book) |
| Spread measure | Range (max − min) | Standard deviation |
| Uses all data in subgroup? | No, only two values | Yes |
| Sensitive to outliers? | More | Less |
| Constants | A₂, D₃, D₄ | A₃, B₃, B₄ |
| Easy by hand? | Yes | Needs a calculator/software |

Both need **rational subgroups** and both show level and spread together. Choose S when the subgroup is large or when outliers distort the range. Choose R for small subgroups taken by hand.`}],keyPoints:["Xbar-S: continuous data, subgroup size about 10 or more.","S chart measures spread with the subgroup standard deviation; uses all values.","Limits: X̿ ± A₃s̄; S chart UCL = B₄s̄, LCL = B₃s̄.","For n = 10: A₃ = 0.975, B₃ = 0.284, B₄ = 1.716.","σ̂ = s̄ divided by c₄.","Read the S chart first; outliers are the book’s reason to prefer S over R."],examTips:["Selection items: “subgroups of 12 measurements” → Xbar-S, not Xbar-R.","Trap: using A₂ (an R-chart constant) with s̄.","Trap: thinking S charts always have LCL = 0 — for n ≥ 6, B₃ > 0.","The book’s reason to choose S over R: outliers can distort the range."]},{topic:"5.2.8",title:"CuSum Chart",pages:"Book pp. 530–531, 542",doc:"book-501-600",pdfPage:33,intro:"A **CuSum (cumulative sum) chart** adds up each point's deviation from the target over time. Small, steady shifts that look harmless one point at a time build up into a clear signal. The book lists it as a **special case**, used when **past data are as important as present data**.",sections:[{heading:"Why CuSum exists",body:`A Shewhart chart (I-MR, Xbar-R) judges **each point on its own**. A shift of about **1 sigma** or less often stays inside the 3σ limits for a long time, so it is missed.

A CuSum chart **remembers**. It sums the deviations from target:
- If the process is on target, positive and negative deviations cancel, and the sum stays near zero.
- If the mean shifts slightly upward, the small positive deviations **accumulate**, and the sum climbs until it crosses a decision limit.

The book's selection table: CuSum is used for the **same reasons as EWMA** (detecting small shifts), **except that past data are as important as present data**. In EWMA, older data get less weight; in CuSum, every past point counts **equally**.

It is listed as **less common** and a **special case**.`},{heading:"How it is calculated (Minitab method)",body:`The book does not show the maths: it says CuSum is **even more complicated than EWMA** and should be done with Minitab or other software. For understanding, Minitab's default **tabular CuSum** works like this:

Set the target $\\mu_0$, the sigma $\\sigma$, an allowance $K=k\\sigma$ (usually $k=0.5$), and a decision limit $H=h\\sigma$ (usually $h=4$ or $5$).

Upper and lower sums, starting at zero:

$$C^{+}_t=\\max\\left(0,\\;x_t-(\\mu_0+K)+C^{+}_{t-1}\\right)$$

$$C^{-}_t=\\max\\left(0,\\;(\\mu_0-K)-x_t+C^{-}_{t-1}\\right)$$

A signal occurs when $C^{+}$ or $C^{-}$ goes **above $H$**. The allowance $K$ stops ordinary noise from building up; only a sustained shift bigger than about $K$ makes the sum grow.`},{heading:"Worked example",body:`Target $\\mu_0=10$, $\\sigma=1$, $k=0.5$ so $K=0.5$, $h=4$ so $H=4$. Upper sum uses $x-10.5$.

| t | x | x − 10.5 | C⁺ |
|---|---|---|---|
| 1 | 10.2 | −0.3 | 0 |
| 2 | 9.8 | −0.7 | 0 |
| 3 | 10.9 | 0.4 | 0.4 |
| 4 | 11.1 | 0.6 | 1.0 |
| 5 | 10.8 | 0.3 | 1.3 |
| 6 | 11.3 | 0.8 | 2.1 |
| 7 | 11.0 | 0.5 | 2.6 |
| 8 | 11.2 | 0.7 | 3.3 |
| 9 | 11.4 | 0.9 | **4.2 > 4** |

**Signal at point 9.** Yet every value is far inside the Shewhart limits $10\\pm 3=7$ to $13$; an I chart would show **no** point beyond the limits. The mean has shifted by about 1σ, and CuSum caught it by accumulating the evidence.`},{heading:"When to choose CuSum and how to read it",body:`**Choose CuSum when:**
- You must detect **small, sustained shifts** (about 0.5–2σ) in the mean.
- The **history matters as much as the latest value** (the book's key phrase).
- You have software — the book says it is rarely done by hand.

**Do not choose it** for large, sudden shifts: a Shewhart chart catches those faster and is simpler for operators.

**Reading:**
- A steady **upward slope** in $C^{+}$ means the mean is above target; a slope in $C^{-}$ means below.
- The point where the slope **starts** shows roughly **when** the shift began — useful for finding the cause.
- After a signal and a fix, the sums are reset to zero.

**CuSum vs EWMA:** both detect small shifts; EWMA weights recent data more (λ), CuSum weights all past data equally.`}],keyPoints:["CuSum = cumulative sum of deviations from target.","Detects small, sustained shifts that Shewhart charts miss.","Book: same reasons as EWMA, except past data are as important as present data.","A special case / less common chart; done with software (book says the maths is more complex than EWMA).","Tabular CuSum: allowance K (often 0.5σ), decision interval H (often 4–5σ); signal when C⁺ or C⁻ > H.","The start of the slope shows when the shift began."],examTips:["The exam often contrasts CuSum and EWMA: CuSum gives equal weight to all past data; EWMA weights recent data more.","Trap: CuSum is not for large sudden shifts — Shewhart charts are better there.","Recognise wording: “small shift”, “historical information as important as present data” → CuSum.","Expect concept questions more than manual calculations."]},{topic:"5.2.9",title:"EWMA Chart",pages:"Book pp. 530–531, 541–542",doc:"book-501-600",pdfPage:33,intro:"The **EWMA (Exponentially Weighted Moving Average) chart** plots a smoothed value that mixes the newest data point with all past values, giving recent data the most weight. It catches **small shifts** and drift, and the book recommends it when outputs are **autocorrelated**.",sections:[{heading:"What EWMA does",body:`The book calls EWMA a **smoothing monitoring system with control limits**. Key facts:
- The plotted items are **not the actual measurements**, but **weighted** measurements.
- It considers **past and historical data**, with older data counting less and less.
- Mostly used for **individual measurements**, sometimes for subgroup averages.
- The selection table: use it when a **small shift** must be detected, often because of **autocorrelation** of output results; used for individuals or averages of **outputs**; **infrequently used** because of calculation complexity.
- It is rarely done without computers.

Because random noise is averaged out, a small but real change in the mean shows up as a steady drift of the EWMA line toward a limit.`},{heading:"Formulas (book p. 541)",body:`**Statistic plotted at time t:**
$$Z_t=\\lambda X_t+(1-\\lambda)Z_{t-1}$$

with $Z_0$ = the target or historical mean $\\bar{X}$. $\\lambda$ is the **weighting factor between 0 and 1**; the book suggests **λ = 0.2**.

**Control limits:**
$$UCL_t=\\bar{X}+3\\dfrac{\\sigma}{\\sqrt{n}}\\sqrt{\\dfrac{\\lambda}{2-\\lambda}\\left[1-(1-\\lambda)^{2t}\\right]}$$
$$LCL_t=\\bar{X}-3\\dfrac{\\sigma}{\\sqrt{n}}\\sqrt{\\dfrac{\\lambda}{2-\\lambda}\\left[1-(1-\\lambda)^{2t}\\right]}$$

$\\sigma$ = historical standard deviation (for individuals, $\\overline{MR}$ divided by $d_2$); $n$ = subgroup size (1 for individuals).

The term $[1-(1-\\lambda)^{2t}]$ makes the limits **narrow at the start** and widen to a steady value as $t$ grows.

**Effect of λ:** small λ (0.05–0.2) = long memory, good for small shifts. λ = 1 turns EWMA into an ordinary individuals chart.`},{heading:"Worked example",body:`Target $\\bar{X}=50$, $\\sigma=2$, $n=1$, $\\lambda=0.2$, $Z_0=50$. New values: 51, 52, 51.5.

**EWMA values:**
- $Z_1=0.2(51)+0.8(50)=10.2+40=50.20$
- $Z_2=0.2(52)+0.8(50.20)=10.4+40.16=50.56$
- $Z_3=0.2(51.5)+0.8(50.56)=10.3+40.448=50.75$

**Steady-state limits** (large $t$, bracket → 1):
$$\\sqrt{\\dfrac{0.2}{2-0.2}}=\\sqrt{\\dfrac{0.2}{1.8}}=0.3333$$
$$3\\times 2\\times 0.3333=2.0\\;\\Rightarrow\\;UCL=52.0,\\;LCL=48.0$$

**Limits at t = 1:** bracket $=1-0.8^{2}=0.36$
$$3\\times 2\\times\\sqrt{0.1111\\times 0.36}=6\\times 0.2=1.2\\;\\Rightarrow\\;48.8\\text{ to }51.2$$

Compare: an individuals chart would have limits $50\\pm 6$ (44 to 56). The EWMA limits are much tighter because the plotted values are smoothed.

**Reading the result.** All three EWMA values (50.20, 50.56, 50.75) are inside the limits, but they rise steadily. If the mean has really moved to about 51.5, $Z$ keeps climbing toward 51.5, and normal noise will soon push it past the UCL of 52 — a signal after several points, not at once. That is the price of smoothing: small shifts are found, but not instantly.`},{heading:"Choosing EWMA and reading it",body:`**Choose EWMA when:**
- You need to detect **small shifts or slow drift** in the mean.
- Data are **autocorrelated** (each value depends on the last, e.g. temperatures, tank levels, rolling network load).
- Data are **individual values** and may be **non-normal** — averaging makes EWMA fairly robust.

**Reading:**
- A run of $Z$ values moving steadily toward one limit shows drift.
- A point beyond the EWMA limits is a signal. Investigate with the OCAP like any chart.
- Do not apply the zone tests used for Shewhart charts; the points are not independent.

**EWMA vs CuSum vs Shewhart:**

| Chart | Weight on past data | Best for |
|---|---|---|
| Shewhart (I, Xbar) | none | large, sudden shifts |
| EWMA | decreasing (λ) | small shifts, autocorrelation |
| CuSum | equal | small sustained shifts, history matters |`}],keyPoints:["EWMA = Exponentially Weighted Moving Average; plots weighted values, not raw data.","Zₜ = λXₜ + (1 − λ)Zₜ₋₁; λ between 0 and 1, book suggests 0.2.","Detects small shifts; recommended when outputs are autocorrelated.","Limits start narrow and widen to a steady value as t grows (the [1 − (1 − λ)²ᵗ] term).","Smaller λ = longer memory, better for small shifts; λ = 1 is an ordinary I chart.","Infrequently used, done with software."],examTips:["Keyword match: “small shift” + “autocorrelation” → EWMA.","Trap: thinking EWMA plots the raw data — it plots weighted averages.","Trap: CuSum vs EWMA — EWMA weights recent data more; CuSum weights all history equally.","If asked for Zₜ, multiply the new value by λ and the old Z by (1 − λ), then add."]},{topic:"5.2.10",title:"Control Methods",pages:"Book pp. 522–537, 543–544, 553",doc:"book-501-600",pdfPage:25,intro:"This topic is about **using** control charts: reading the zones, applying the special-cause tests, reacting with an Out-of-Control Action Plan, and choosing the right level of control. The book's message: the power of SPC is not the limits, it is **how you react**.",sections:[{heading:"Common vs special cause; control vs spec limits",body:`- **Common cause** = natural, random variation present in every process. **Do not adjust** for it.
- **Special cause** = unnatural variation: an **assignable** reason or a **pattern** (trend, shift). It needs investigation and action.

Control limits sit about **±3σ** from the centre line and cover **99.73%** of natural variation for normal data. They are the **voice of the process (VOP)**. Specification limits are the **voice of the customer (VOC)**.

The book advises **never** putting spec limits on a control chart. A process can be **in control but not capable** (stable but making out-of-spec output); this happens when control limits are wider than the specs (Cp < 1). For capability the exam convention is **Cpk ≥ 1.33**.

SPC tells you **that** a special cause happened — not **why**.`},{heading:"Zones and the eight tests",body:`Each half of the chart has three zones: **C** (within 1σ), **B** (1–2σ), **A** (2–3σ).

| Test | Rule | Usually means |
|---|---|---|
| 1 | 1 point beyond 3σ | Assignable cause (most used) |
| 2 | **9 in a row** on one side | Shift in the mean |
| 3 | 6 in a row all increasing or decreasing | Trend / drift |
| 4 | 14 in a row alternating up and down | Non-random pattern |
| 5 | 2 of 3 points in zone A or beyond, same side | Shift in mean or worse variation |
| 6 | 4 of 5 points in zone B or beyond, same side | Shift in mean or worse variation |
| 7 | 15 in a row in zone C | Much **less** variation |
| 8 | 8 in a row outside zone C (both sides) | Much worse variation |

Tests 1–4 apply to all charts and are the **only** tests for R, MR, S and attribute charts. Western Electric uses 8 in a row; the exam and Minitab use **9**. Pick one rule set and use it **consistently**.`},{heading:"Applying the tests — example",body:`An I chart has centre line 50 and σ = 2.
- Zone C: 48–52; zone B: 52–54 (and 46–48); zone A: 54–56 (and 44–46); limits 44 and 56.

Read these runs:
1. Points 53, 55, 51 → only 55 is in zone A → **no** Test 5. Points 54.5, 51, 55 → two of three in zone A on the same side → **Test 5 signal**.
2. Values 50.5, 51, 50.2, 51.8, 50.9, 51.3, 50.4, 51.1, 50.7 → **nine** in a row above 50 → **Test 2** (distance from the line does not matter).
3. 47, 47.5, 48, 49, 50, 51, 52 → six increases from seven points → **Test 3**.
4. 57 → beyond UCL → **Test 1**; one point is enough, act at once.

Minitab marks a failing point in red with the **test number**.`},{heading:"Reacting: OCAP and no tampering",body:`**Out-of-Control Action Plan (OCAP).** A pre-agreed flowchart for each chart: which causes to check, in what order, and what to do to bring the process back. The book: SPC needs an **immediate response** to special causes.

**Do not over-adjust.** Being off the centre line is **not** a signal, because common cause exists. If operators adjust on every point, **variability increases**. The rule: **if the rules show no out-of-control condition, make no adjustment.**

After a correction, wait for the next sample. If it is back in control, **change nothing more**, even if the next point is above the centre line.

**Recalculating limits.** Only after a **verified** change (reduced variation or a known shift — confirm with a hypothesis test) or at a planned review every **3, 6 or 12 months**. Otherwise keep the historical limits frozen.

**Pre-Control.** The only chart that uses **spec limits**: green zone = middle half of the tolerance, yellow = outer quarters, red = outside spec. Qualify with **5 consecutive greens**; then check 2 parts at a time. Use only for **outputs**, often at set-up.`},{heading:"Ranking control methods",body:`The book ranks controls by effectiveness:
1. **Type 1 countermeasure** — mistake proofing/design change; defect cannot happen.
2. **Type 2 flag** — detects the error and shuts down.
3. **SPC on X's** with trained staff who are **empowered** to stop and investigate.
4. **Type 3 inspection** — short-term containment (audits, 100% inspection); also SPC where trained operators are **not empowered** to stop.
5. **SOP** alone — not sustainable.

**SPC without proper use = "wall paper".** Doing SPC just to say you do SPC wastes time and makes people reject the tool.

Using the **right level** of control increases acceptance of the change and sustains the gain long term.`}],keyPoints:["Control limits ≈ ±3σ = voice of the process; spec limits = voice of the customer; keep specs off control charts.","In control = stable and predictable; not necessarily capable.","Test 1: one point beyond 3σ; Test 2: 9 in a row on one side; Test 3: 6 trending; Test 4: 14 alternating.","Only tests 1–4 apply to R, MR and S charts and to attribute charts.","Test 7 (15 in zone C) signals reduced variation — still a special cause to investigate.","React with the OCAP; never adjust when there is no signal (tampering raises variation).","Recalculate limits only after a verified process change or at a planned review (3/6/12 months)."],examTips:["Use exam convention: 9 points in a row on one side (not 8), 6 in a row trending, 14 alternating.","Trap: “a point near the limit but inside it” is not a signal by itself.","Trap: 15 points hugging the centre line looks good but is a special-cause pattern (often wrong subgrouping or wide limits).","Trap: recalculating limits after every new batch of data hides real shifts.","Pre-Control is the only SPC tool with spec limits on it — used for outputs and set-ups."]},{topic:"5.3.1",title:"Cost Benefit Analysis",pages:"Book pp. 556–562, 577–578",doc:"book-501-600",pdfPage:59,intro:"Before a solution goes into the control plan, the team must show it is **worth doing**: its impact is high enough for its cost and time. The book teaches this through impact, cost and time considerations and the **Improvement Selection Matrix**, and ends the Control roadmap with **Verify Financial Impact**.",sections:[{heading:"Why it matters in Control",body:`The book says the last physical result of Control is the **control plan**, and the aim is to **sustain the gains** from Define to Improve. Final decisions on defect-reduction tools meet obstacles: **capital** may be needed, **training** hurdles, and **management buy-in** not yet complete.

A Six Sigma project moves from **practical problem → statistical problem → statistical solution → practical solution**. The last step is a **business decision**. The book: "a cost benefit analysis is always a good tool" to set priorities.

People pull in different directions — engineering wants the gold standard, sales wants inventory, production wants capacity. A **quantified** evaluation balances these wishes.

For a few small changes the full tool is unnecessary; smaller projects have "few but vital" control methods.`},{heading:"The three criteria: impact, cost, time",body:`**Impact.** Long-term vs short-term effectiveness. If a supplier is about to lose a major customer, a short-term fix may come first. Order of effectiveness: **remove the root cause** > **monitor/flag** the condition > **inspect** for defects > **train** people not to make defects.

**Cost.**
- **Initial (one-time):** training the existing workforce, new materials, resources to build the improvement, capital investment.
- **On-going (recurring):** future training, inspection, monitoring, material costs.

**Time.**
- **Technical** constraint: the minimum time to build and implement.
- **Political** constraint: other priorities competing for the technical people.
- **Cultural** constraint: how long it takes to win stakeholder support.

Low-cost items that can be **expensed without capital approval** are often preferred because they are faster to approve.`},{heading:"The Improvement Selection Matrix",body:`The matrix looks like the **X-Y Matrix**:
1. List the project outputs (Y's) across the top with **significance ratings 1–10** — the same numbers as the updated X-Y Matrix.
2. List the potential improvements down the side.
3. Rate each improvement's **impact** on each output **0–7** (7 = X removed from impacting the output; 1 = people trained; 0 = no impact).
4. **Overall impact** = sum of (impact × significance).
5. Rate **cost 0–7** (7 = minimal cost; 0 = significant capital without business alignment) and **time 0–7** (7 = under a week; 0 = over a year).
6. **Overall rating** = overall impact × cost rating × time rating. Highest = best choice.

A **cost or time rating of 0** removes the improvement from consideration. Ratings should be made by the **whole team**. Consider running improvements **in parallel**.`},{heading:"Worked example — the book’s hotel matrix",body:`Book p. 561: a hotel conference with four outputs and significance 10, 9, 8, 9.

Improvement 1, "Hotel staff monitors room", has impact ratings 2, 2, 6, 0.

**Overall impact:**
$$10(2)+9(2)+8(6)+9(0)=20+18+48+0=86$$

Cost rating 7, time rating 7:
$$\\text{Overall}=86\\times 7\\times 7=4214$$

Improvement 2, "Management visits / leaves phone number", impacts 2, 0, 4, 0:
$$10(2)+9(0)+8(4)+9(0)=52\\qquad 52\\times 7\\times 7=2548$$

Improvement 1 ranks higher. If an option had a time rating of 0 (over a year), its overall score would be **0**, and it drops out.`},{heading:"Simple money check and verifying benefits",body:`The book gives no ROI formula, but a simple **payback** check is common practice:

$$\\text{Payback (years)}=\\dfrac{\\text{one-time cost}}{\\text{annual savings}-\\text{annual recurring cost}}$$

**Example.** One-time cost 20,000; annual savings 45,000; recurring monitoring cost 5,000 per year.
$$\\text{Payback}=\\dfrac{20000}{45000-5000}=\\dfrac{20000}{40000}=0.5\\text{ years}$$

**Verify Financial Impact** is the last step of the Control roadmap. The book's checklist asks whether the **Champion, the Belt and Finance** agree the project is complete, and lists "financial benefits not tracked and integrated into the business" as a Control roadblock. The control plan is filed with the project so it can **track benefits** and act as a reference if results are not sustained.`}],keyPoints:["Selecting solutions is a business decision; use cost-benefit analysis to set priorities.","Three selection criteria: impact, cost, time.","Initial costs: training existing staff, materials, build resources, capital. On-going: future training, inspection, monitoring, materials.","Time constraints: technical, political, cultural.","Selection Matrix: overall impact = Σ(impact × significance); overall rating = impact × cost × time.","Impact, cost and time are rated 0–7; a 0 for cost or time removes the option.","The Control roadmap ends with Verify Financial Impact (Champion, Belt and Finance agree)."],examTips:["Classify costs: “monitoring” and “future training” are recurring; “capital” and “training current staff” are initial.","Matrix calculation: multiply impact by significance and add, then multiply by cost and time ratings.","Trap: a high impact cannot rescue an option rated 0 on cost or time.","Trap: political vs cultural constraint — political = competing priorities; cultural = stakeholder support."]},{topic:"5.3.2",title:"Elements of the Control Plan",pages:"Book pp. 556, 562–574",doc:"book-501-600",pdfPage:65,intro:"A **control plan** is the written summary of how the improved process will be monitored and controlled after the project team leaves. The book names **five elements**: training, documentation, monitoring, response, and aligning systems and structures. It is the last physical result of the Control phase.",sections:[{heading:"What a control plan is",body:`The book defines the control plan as:
- A **written summary** of the systems used to monitor and control process or product variation.
- A document that formally records **all control methods** used to meet the project goal.
- A **living document**, updated as new measurement systems and controls are added.
- Often used to create a concise **operator inspection sheet**.

It is **not** a replacement for detailed operating, maintenance or design instructions. It **is** an essential part of the **final project report**, filed with the project to **track benefits** and to serve as a **reference if results are not sustained**.

**Inputs** used to build it: results from Measure and Analyze, lessons from similar processes, team knowledge, design FMEAs, design reviews, and the defect-prevention methods selected.`},{heading:"Who and why",body:`**Who creates it?** The **project team**, plus anyone who has a role in defining, executing or changing the process: associates, technical experts, supervisors, managers, the site manager, HR.

**Why?**
- Project results must be **sustained**.
- It makes operators, engineers and managers follow the **designated control methods**.
- It lets the **Belt move on** to other projects.
- It prevents the need for "constant heroes" who keep solving the same problem.
- Customers increasingly **require** control plans.

**Ownership.** In the book's diagram, the plan sits between "implemented improvements" and "verified financial impact", and **process owners are accountable** for keeping the new level of performance. The best way to win acceptance is **sign-off by supervisors and management** of the area.`},{heading:"The five elements",body:`| Element | Key content (book) |
|---|---|
| **Training plan** | Who needs training (people affected by the change and by the control plan, including future process changers); who trains (project team now, then a training department/process owner); triggers for ongoing training: new-hire orientation, refresher, **response plan** when performance degrades |
| **Documentation plan** | Updated process maps, SOPs, FMEA, training manuals, monitoring plan (charts, reports), response plan (FMEA), job descriptions. Who updates and who reviews. Must be kept current |
| **Monitoring plan** | What, when and how to sample and measure; SPC charts posted where data are collected; FMEA (reassess RPNs); checklists; visual management (red/yellow/green). Belt develops it; functional managers own adherence |
| **Response plan** | What to do when monitoring shows a defect or out-of-control signal (see 5.3.3) |
| **Aligning systems and structures** | Performance goals, policies, job descriptions, incentive pay and programmes aligned with the new behaviour |

The book's Control sequence: improvement selected → training → documentation → monitoring → response → align systems → verify financial impact.`},{heading:"A control-plan row and example",body:`In practice each controlled characteristic gets one row:

| Column | Example (P2 incident restore time) |
|---|---|
| Process step | Diagnose and restore |
| Characteristic (X or Y) | Mean restore time per day (Y) |
| Specification / target | ≤ 4 h (SLA) |
| Measurement method & MSA | ITSM timestamps; clock-stop rules audited |
| Sample size & frequency | Every P2 incident, daily mean |
| Control method | I-MR chart, tests 1–4 |
| Owner | Incident manager |
| Reaction | Response plan RP-01 (OCAP) |

**Checking a chart limit for the row.** From 20 days, $\\bar{X}=3.03$ h and $\\overline{MR}=0.455$ h:
$$UCL=3.03+2.66\\times 0.455=3.03+1.21=4.24\\text{ h}$$
The SLA (4 h) is a **spec**; it goes in the specification column, not on the chart.

The column set is common industry layout; the book shows the five-plan structure rather than one fixed template.`},{heading:"Handover and keeping it alive",body:`**At handover** the Belt makes sure all documents are **current**, that there is a process to **modify** documents when the process changes, and a process to **review** them regularly. Functional managers must be **trained** and **accountable** for the monitoring plan.

**Keep it alive:**
- Update the plan when new measurements or controls are added.
- Revisit the **FMEA** and reassess RPNs as the process changes.
- Set new control limits **only** on signals that performance has changed.

**Aligning systems.** Remove measures that reward the old behaviour, remove duplicate measures, add measures for desired behaviour, and ask whether incentives (for example hourly pay schemes) work against the change.

**Book checklist questions:** Is there a control plan? Has it been handed to the **process owner**? Is the FMEA updated? What stops this being reinvented? Do the **Champion, Belt and Finance** agree the project is complete?`}],keyPoints:["Control plan = written summary of the methods that monitor and control the process; a living document.","Five elements: training, documentation, monitoring, response, aligning systems and structures.","Not a replacement for detailed work instructions; part of the final project report.","Created by the project team plus everyone who defines, runs or changes the process.","Process owners are accountable for sustaining performance; sign-off by area management.","Belt develops the monitoring plan; functional managers own adherence.","Systems and structures (goals, job descriptions, incentives) make behaviour change permanent."],examTips:["A common question asks which item is NOT one of the five elements — e.g. “hypothesis test plan” or “project charter”.","Trap: the control plan does not replace SOPs or detailed instructions.","Trap: the Belt does not own the process after handover — the process owner does.","Know that training is also triggered by the response plan when performance degrades."]},{topic:"5.3.3",title:"Elements of the Response Plan",pages:"Book pp. 544–548, 565–572",doc:"book-501-600",pdfPage:74,intro:"A **response plan** says exactly what to do when monitoring shows a defect or an out-of-control signal. It turns a chart signal into a fast, agreed action, instead of panic or guesswork. It is one of the five elements of the control plan.",sections:[{heading:"Definition and triggers",body:`The book: response plans **outline the process to follow when there is a defect or an out-of-control condition** from monitoring.

**Five triggers** for a response:
1. An **out-of-control point** on a control chart.
2. **Non-random behaviour within** the control limits (a run, trend or pattern).
3. A **condition or variable proven to produce defects** is present.
4. A **check-sheet failure**.
5. An **automation failure**.

Note trigger 2: a response is needed even when every point is **inside** the limits, if the pattern breaks the special-cause rules.

The book adds: response to poor results **must be part of training**, and response plans are **living documents**, updated as new information arrives.`},{heading:"The five components",body:`Each response plan should contain:

| Component | Question it answers |
|---|---|
| **Triggers** | What failure modes do we check for? Usually the **highest-risk X's** (from the FMEA) |
| **Recommended response** | What exactly do we do for this failure mode? |
| **Responsibilities** | Who responds, and who is told or escalated to? |
| **Documentation that the plan was followed** | How do we prove the response happened? |
| **Detailed information on the conditions** | What were the circumstances when the failure mode occurred? |

In the documentation plan, the response plan is recorded through the **FMEA**: the failure modes, causes and controls already listed there become the triggers and actions.`},{heading:"OCAP — the response on the chart",body:`For SPC, the response is written as an **Out-of-Control Action Plan (OCAP)**: a flowchart attached to the chart listing the checks and actions, in order.

The book's rules for responding:
- The power of SPC is **reacting** to out-of-control signals with the OCAP.
- Respond **immediately** to a special cause.
- **Only** respond to real signals; adjusting on every point **increases variation**.
- After a correction, **wait for the next sample**. If the process is back in control, make **no more changes**, even if the point is above the centre line.
- With **no special cause**, the OCAP is not used and **no action** is taken.

**Example from the book.** A response-time I chart (UCL 39.76, mean 18.38) shows a point above the UCL. The OCAP says: "If response time is too high, get an additional person on the phone bank."`},{heading:"The abnormality report",body:`When a failure mode occurs, the book recommends an **abnormality report**. It:
- gives **detailed documentation** of each failure;
- supports **continuous improvement** and reinforces commitment to eliminating defects;
- fits the **ISO 9000** idea of a **Corrective Action Request (CAR)**;
- collects the **frequency** of corrective actions.

Typical fields:
- **Process** and **metric**.
- **Current situation:** signal, situation code, details, date.
- **Investigation of cause:** cause code, corrective action.
- **Root cause analysis:** who is involved, what will be done, date for analysis, date for **permanent prevention**.

Counting abnormality reports over time shows which failure modes return most often — input for the next improvement.`},{heading:"Worked example — a response trigger",body:`A billing team monitors the daily proportion of disputed invoices with a P chart. Historical $\\bar{p}=0.04$, daily sample $n=200$.

**UCL:**
$$3\\sqrt{\\dfrac{0.04\\times 0.96}{200}}=3\\sqrt{0.000192}=3\\times 0.01386=0.0416$$
$$UCL=0.04+0.0416=0.0816$$

As a count: $0.0816\\times 200=16.3$, so **17 or more** disputes in a day is a Test 1 trigger.

**Response plan row:**
- *Trigger:* 17+ disputes in a day, or 9 days in a row above 4%.
- *Response:* check the tariff table load log first; if changed, roll back; hold the bill run.
- *Responsible:* billing shift lead; escalate to the billing manager within 1 hour.
- *Documentation:* abnormality report in the ticket tool.
- *Conditions:* record bill cycle, tariff version, product mix.

If monitoring keeps showing degradation, **refresher training** is triggered too.`}],keyPoints:["Response plan = the process to follow when monitoring shows a defect or out-of-control condition.","Five triggers: OOC point, non-random pattern within limits, defect-causing condition present, check-sheet failure, automation failure.","Five components: triggers, recommended response, responsibilities, proof the plan was followed, conditions surrounding the failure.","Triggers usually monitor the highest-risk X’s (from the FMEA).","For charts the response is the OCAP; act only on real signals.","Abnormality report = detailed record of each failure; fits ISO 9000 CAR.","Living document; response to poor results must be in training."],examTips:["A pattern inside the limits (e.g. 9 in a row on one side) is still a trigger — do not choose “no action because all points are inside”.","Trap: “adjust the process whenever a point is above the centre line” — that is tampering, not a response plan.","Know the five components; a distractor may list “capital budget” or “project charter”.","Response plan vs monitoring plan: monitoring detects; response says what to do after detection."]}],je=Object.freeze(Object.defineProperty({__proto__:null,lessons:De},Symbol.toStringTag,{value:"Module"})),f={pages:"Syllabus + academy lessons",doc:"syllabus",pdfPage:7},Le=[{topic:"1.1.1",title:"Meanings of Six Sigma",...f,intro:`"Six Sigma" has **three meanings**: a **metric** (how good a process is), a **methodology** (DMAIC, the way to improve it) and a **management philosophy** (how leaders think and decide). All three rest on one idea: make the process so consistent that almost every result falls inside the customer's limits. The exam expects you to keep the three meanings apart and to know the famous number, **3.4 defects per million opportunities**.`,sections:[{heading:"Three meanings, one idea",body:`Think of a promise to restore a business line within four hours. Each meaning asks a different question about that promise.

- **Metric** — *How often do we break the promise?* Performance is stated as a sigma level, DPMO or yield. "Six Sigma performance" means about **3.4 defects per million opportunities**.
- **Methodology** — *How do we find out why we break it, and stop it?* The answer is a **DMAIC** project: Define, Measure, Analyze, Improve, Control.
- **Philosophy** — *How should leaders behave so that improvement continues?* Decisions use data, the customer defines "good", and improvement never stops.

The course book's glossary (p. 589) describes the Six Sigma *system* as analytical tools, project management, reporting and management techniques **combined** into one problem-solving and business-improvement method. A short memory hook: **metric = how good, methodology = how to get better, philosophy = how we think and lead.**`},{heading:"Variation causes defects",body:`A **defect** is any result that fails a customer requirement. A **defective** unit has at least one defect. One invoice with three errors is three defects but only one defective invoice.

Why do defects happen? Often the average is fine, but the results **vary** too much. Customers do not feel your average. They feel *their own* result. An average restore time of 2.5 hours can hide some 7-hour restorations.

The book (pp. 209–210) lists four ways to fix an output that misses its limits:

| Option | Book's comment |
|---|---|
| Shift the mean | Usually the easiest |
| Reduce variation | Usually harder |
| Shift the mean **and** reduce variation | The **primary objective** of Six Sigma projects |
| Widen the specification limits | Customers rarely accept it |

The book also says variation exists in everything: you cannot remove it completely, but you can **minimise and control** it.`},{heading:"Sigma and the sigma level (Z)",body:`The Greek letter **σ (sigma)** is the **standard deviation**: how far results typically sit from their average. The **sigma level (Z)** counts how many standard deviations fit between the process mean and the **nearest** specification limit (book glossary, p. 588):

$$Z = \\dfrac{\\text{nearest spec limit} - \\text{process mean}}{\\sigma}$$

If only one σ fits, many results fall outside the limit. If six σ fit, results outside the limit are very rare. Notice the key picture: **the specification stays still; the curve gets narrower.**

| Sigma level | Long-term DPMO | Yield |
|---|---|---|
| 3 | 66,807 | 93.3% |
| 4 | 6,210 | 99.38% |
| 5 | 233 | 99.977% |
| 6 | 3.4 | 99.99966% |

Each step is a big jump. Going from 3σ to 4σ cuts defects about ten times.`},{heading:"Where 3.4 DPMO comes from: the 1.5σ shift",body:`A perfectly centred process with six σ to each limit would give only about **0.002** defects per million. So why do we say **3.4**?

The book (p. 214) says even stable processes **drift and shift over time by about 1.5 standard deviations**. Short-term data shows the process at its best. Long-term data includes the drift. So:

$$Z_{\\text{short-term}} = Z_{\\text{long-term}} + 1.5$$

Six short-term sigmas minus 1.5 leaves 4.5 long-term sigmas, and the tail beyond 4.5σ is about 3.4 per million (book table, p. 223).

**Exam convention:** Six Sigma = **3.4 DPMO**, and this figure **includes** the 1.5σ shift. The value 0.002 ppm is the theoretical centred figure and is a common wrong option. Remember also that 3.4 is per million **opportunities**, not per million units or customers.`},{heading:"Practical problem → statistical problem → practical solution",body:`The book (p. 208) sums up the method in four boxes: **define a practical problem → turn it into a statistical problem → solve the statistical problem → apply the solution to the practical problem.** In other words, Six Sigma replaces opinion with data at every step.

**Worked example.** Ticket resolution time has mean 20 hours and σ = 4 hours. The SLA (USL) is 32 hours.

$$Z = \\dfrac{32 - 20}{4} = \\dfrac{12}{4} = 3$$

The process is at about **3σ**. Now the team halves the spread to σ = 2 hours, without changing the SLA:

$$Z = \\dfrac{32 - 20}{2} = \\dfrac{12}{2} = 6$$

Reducing variation alone moved the process from 3σ to 6σ.

**Common mistake:** dividing the limit by σ (32 and 4 gives "8σ"). Always subtract the **mean** first — Z measures the distance from the mean to the limit.`}],keyPoints:["Six Sigma has three meanings: a metric, a methodology (DMAIC) and a management philosophy.","Six Sigma performance = **3.4 DPMO** (long-term, including the 1.5σ shift).","Sigma level Z = distance from the mean to the **nearest** spec limit, measured in standard deviations.","Higher sigma level = smaller spread = fewer defects. The spec limits do not move.","Primary objective of projects (book): shift the mean **and** reduce variation.","Defect = one failure to meet a requirement; defective = a unit with at least one defect.","$Z_{ST} = Z_{LT} + 1.5$ — short-term sigma is 1.5 higher than long-term."],examTips:["If an option says 0.002 defects per million, it is the centred theoretical value. The expected answer is 3.4 DPMO.","Watch the denominator: 3.4 is per million **opportunities**, not units or customers.",'"Which is NOT a meaning of Six Sigma?" — "a guarantee of zero defects" is the answer; zero defects is Crosby, not Six Sigma.',"Do not confuse σ (the spread) with the sigma level. A larger σ means a **lower** sigma level."]},{topic:"1.1.2",title:"General History of Six Sigma & Continuous Improvement",...f,intro:'Lean Six Sigma grew from three strands: **statistical quality control** (1920s onward), the **Toyota Production System** (which became Lean) and **Six Sigma itself**, born at **Motorola** in the mid-1980s and spread by AlliedSignal and GE. Knowing who did what helps you answer "who originated / who popularised" questions. Note: the supplied course book has no history pages; this lesson follows the academy lesson, and the syllabus itself says DMAIC "was originally established by Motorola".',sections:[{heading:"The statistical roots: Shewhart, Deming, Juran",body:`**Walter Shewhart** (Bell telephone system) drew the first **control chart** in **1924**. His key idea: all processes vary, but there are two kinds of variation — ordinary **common-cause** noise and unusual **special-cause** signals. Reacting to every small change makes things worse. His cycle of specification, production and inspection later became **PDCA** (Plan–Do–Check–Act).

**W. Edwards Deming** took these ideas to Japan and lectured there from **1950**. He taught that most quality problems belong to the **system**, which only management can change. He wrote the **14 Points for Management** and preferred the name **PDSA** (Plan–Do–**Study**–Act).

**Joseph Juran** wrote the *Quality Control Handbook* (1951) and described the **Juran Trilogy**: quality planning, quality control and quality improvement. He also named the **Pareto principle** ("vital few, trivial many") after the economist Vilfredo Pareto (1848–1923, book glossary p. 587). Pareto studied wealth; Juran applied the idea to quality.`},{heading:"The wider quality movement: Feigenbaum, Ishikawa, Crosby",body:`**Armand Feigenbaum** (1950s) said quality cannot be inspected in by one department. It is **everyone's job**, from design to service. He called this **Total Quality Control**, an idea that fed into TQM.

**Kaoru Ishikawa** made quality tools easy for front-line workers. He is known for the **cause-and-effect (fishbone) diagram** and for **quality circles** — small teams solving problems in their own area.

**Philip Crosby** wrote *Quality Is Free* (1979). He argued that doing it right the first time costs less than fixing failures. He promoted **zero defects** and measuring the "price of nonconformance", an early form of the cost of poor quality.

Be careful: **zero defects is Crosby's idea, not the definition of Six Sigma.** Six Sigma accepts a very small, non-zero defect rate (3.4 DPMO).`},{heading:"Motorola invents Six Sigma",body:`In the early 1980s **Motorola** was losing to Japanese competitors on quality. Engineer **Bill Smith** saw that products with many factory defects also failed more often in the field. He argued for processes with a large safety margin — about six standard deviations inside the specification. With strong support from CEO **Bob Galvin**, Motorola launched Six Sigma around **1986–87**, with a stretch target of 3.4 defects per million opportunities. In **1988** Motorola was among the first winners of the US **Malcolm Baldrige National Quality Award**.

Bill Smith is often called the **father of Six Sigma**. The IASSC syllabus credits the DMAIC model to Motorola.

Key exam words: Motorola **originated / developed / invented** Six Sigma.`},{heading:"AlliedSignal and GE scale it up",body:`**Larry Bossidy** made Six Sigma central at **AlliedSignal** in the early 1990s. Then **Jack Welch** launched it across **General Electric (GE)** from **1995**.

GE turned Six Sigma into a **leadership system**:

- it trained large numbers of Green Belts and Black Belts;
- it linked every project to **financial results**;
- it tied executive bonuses to Six Sigma participation.

GE's public reports of large savings made Six Sigma a global management movement and carried it into services, finance and telecoms.

Key exam words: GE **popularised / deployed / scaled** Six Sigma. It did **not** invent it. A question asking which company *originated* Six Sigma, with GE as an option, is a classic trap.`},{heading:"The Toyota strand and the merger into Lean Six Sigma",body:`In parallel, **Toyota** (Taiichi Ohno, Shigeo Shingo, the Toyoda family) built the **Toyota Production System**, which attacked waste and delay. In 1988 John Krafcik named it **"lean"** (see topic 1.4.2).

For years Lean and Six Sigma competed. Then practitioners saw they solve two halves of one problem: **Lean removes waste and speeds up flow; Six Sigma removes variation and defects.** By the **early 2000s** organisations combined them as **Lean Six Sigma**, usually with DMAIC as the backbone and Lean tools inside it.

| Era | Main idea | Key names |
|---|---|---|
| 1920s–1950s | Statistical control of variation | Shewhart, Deming, Juran |
| 1950s–1970s | Quality is everyone's job | Feigenbaum, Ishikawa |
| 1940s–1970s | Flow and waste elimination | Toyoda, Ohno, Shingo |
| 1979–1990 | Cost of quality; "lean" named | Crosby, Krafcik |
| Mid-1980s–1990s | Six Sigma and DMAIC | Smith, Motorola, Bossidy, Welch |
| Early 2000s → | Lean Six Sigma | Combined practice |`}],keyPoints:["Six Sigma was **originated at Motorola** (mid-1980s, Bill Smith, Bob Galvin); the syllabus credits DMAIC to Motorola.","GE (Jack Welch, from 1995) and AlliedSignal (Larry Bossidy) **popularised** it.","Shewhart: control chart (1924), common vs special cause, the cycle that became PDCA.","Deming: taught Japan from 1950, 14 Points, PDSA. Juran: Trilogy, named the Pareto principle.","Ishikawa: fishbone diagram and quality circles. Feigenbaum: Total Quality Control.","Crosby: zero defects and *Quality Is Free* — not the same as Six Sigma (3.4 DPMO).","Lean Six Sigma = Lean (waste, speed) + Six Sigma (variation, defects), early 2000s."],examTips:['Read the verb: "originated/developed" → Motorola; "popularised/scaled" → GE.',"Who named or applied the 80:20 idea to quality? Juran — not Vilfredo Pareto.","PDCA grew from Shewhart; Deming popularised it and called it PDSA.",'"Which is NOT part of the Toyota Production System?" — DMAIC (it belongs to Six Sigma).']},{topic:"1.1.3",title:"Deliverables of a Lean Six Sigma Project",...f,intro:'Every DMAIC phase must hand over **deliverables** — evidence that the phase question has been answered — before the project can pass its **tollgate**. The exam often asks "which deliverable belongs to which phase?", and the most tested phase is **Define**, whose core output is the **project charter**.',sections:[{heading:"Each phase answers one question",body:`- **Define** — What is the problem, why does it matter, and what does success look like?
- **Measure** — How big is the problem today, and can we trust the data?
- **Analyze** — What are the **verified** root causes?
- **Improve** — Which solutions remove those causes, and do they work?
- **Control** — How do we keep the gain and prove the benefit?

The deliverables are the evidence. Without them teams jump from a bad month straight to a solution ("hire two more engineers") with no baseline and no proven cause.

The book's **DMAIC roadmap** (p. 230) shows the same flow. The **Champion / Process Owner** first identifies the problem area. The **Define** steps are *determine appropriate project focus*, *estimate COPQ* and *establish team*. Measure assesses stability, capability and the measurement system; Analyze proves which X's matter; Improve selects and implements solutions; Control implements a control plan and finally **verifies the financial impact**.`},{heading:"Deliverables phase by phase",body:`| Phase | Typical deliverables |
|---|---|
| **Define** | Project charter (business case, problem statement, goal statement, scope, team, milestones), VOC turned into CTQs, high-level process view, stakeholder analysis, **preliminary COPQ**, tollgate sign-off |
| **Measure** | Detailed process map, data collection plan, validated measurement system (MSA), baseline and capability of Y, list of potential X's |
| **Analyze** | Hypothesis-test results, **verified** root causes (the vital few X's) |
| **Improve** | Selected and justified solutions, pilot results, implementation plan, measured improvement in Y |
| **Control** | Control plan, control charts, standard work, handover to the process owner, **verified financial benefits**, closure |

The book's phase checklists (pp. 229, 416, 488) repeat a common core in every phase: **team members, primary metric, secondary metric(s), project plan, and issues and barriers**. The Belt presents them to the mentor and the project Champion.`},{heading:"Define outputs in detail",body:`The central Define document is the **project charter**, usually one page agreed between the team and its sponsor:

- **Business case** — why this project, why now, link to business goals.
- **Problem statement** — what is wrong, where, when, how big — with **no cause and no solution**. The book glossary (p. 587) calls it a short statement that bounds and describes the problem.
- **Goal (objective) statement** — the measurable target and date; the book calls it a statement of goals, timing and expectations.
- **Scope** — what is in and out.
- **Team, roles and milestones.**

Around the charter, Define also delivers the **VOC translated into CTQs**, a **high-level process view** (often a SIPOC, although the syllabus lists SIPOC under Measure 2.1.2), a **stakeholder analysis** and a **preliminary COPQ** estimate.

The book's project review (p. 473) lists what Define achieves: the team **understands the problem and its business impact**, has **set firm improvement goals** and has **quantified the output characteristic**. All three are about framing, not solving.`},{heading:"Two boundaries the exam loves",body:`**1. Root causes are verified in Analyze, not Define.** In Define the team may *list* suspected causes. Proving them with data is Analyze work. An option saying Define "identifies the verified root cause" is wrong.

**2. Benefits are estimated in Define and verified in Control.** The business case and preliminary COPQ are **estimates**. Real savings are confirmed only at the end of Control ("Verify Financial Impact"), ideally by Finance.

| Item | Belongs in | Not in |
|---|---|---|
| Listing suspected causes | Define / Measure | — |
| Verifying root causes with data | Analyze | Define |
| Estimating financial benefit | Define | Control |
| Confirming realised savings | Control | Define |
| Validating the measurement system | Measure | Define |
| Piloting a solution | Improve | Analyze |

The book also notes that over 80% of projects find their solutions in Analyze (p. 417), and that the problem statement and COPQ are living outputs: the Measure checklist asks "Has the Problem Statement changed?" and "Have you identified more COPQ?" (p. 231).`},{heading:"Tollgate reviews and a worked example",body:`At a **tollgate review** the Belt presents the phase deliverables and the **Champion** decides: **go** (next phase), **recycle** (fix gaps and return) or **stop** (the project is no longer worth it — a valid result). A tollgate is a decision based on evidence, not a status meeting.

**Worked example — sort the folder.** An invoice-dispute project folder holds: (1) a gauge R&R study; (2) a signed charter; (3) a control chart handed to the billing manager; (4) a regression proving disputes rise with manual tariff overrides; (5) a pilot of an automated tariff check; (6) a stakeholder map.

- Define: **2, 6** (frame the project and its people)
- Measure: **1** (can we trust the data?)
- Analyze: **4** (cause proven with data)
- Improve: **5** (solution tested)
- Control: **3** (gain sustained by the owner)

Trap: putting (4) in Define "because the team already suspected it". A suspicion may be noted in Define, but the statistical proof is Analyze.`}],keyPoints:["Core Define deliverable: the **project charter** (business case, problem, goal, scope, team, milestones).","Other Define outputs: CTQs from VOC, high-level process view, stakeholder analysis, **preliminary COPQ**.","Book roadmap Define steps: determine project focus, **estimate COPQ**, establish team.","Root causes are **verified in Analyze**, never in Define.","Benefits: **estimated** in Define, **verified** in Control (last step: Verify Financial Impact).","Tollgate outcomes: go, recycle or stop — decided by the Champion.","Every phase report repeats: team, primary metric, secondary metrics, project plan, issues and barriers."],examTips:['"Which is a Define deliverable?" — choose the charter or CTQs, not MSA, verified root causes or a control plan.','"Which is NOT part of a project charter?" — a control plan or a selected solution.','"What should the Belt do FIRST after the project is approved?" — draft the charter, not collect data or brainstorm solutions.','Words like "verified", "proven", "confirmed" point to Analyze (causes) or Control (benefits).']},{topic:"1.1.4",title:"The Problem Solving Strategy Y = f(x)",...f,intro:"$Y = f(X)$ says that every **output (Y)** is the result of **inputs (X's)** and the way the process combines them. So you cannot fix an output by watching it harder — you must find and control the few inputs that drive it. This is the logic behind the whole DMAIC roadmap.",sections:[{heading:"Reading the equation",body:`Think of a cake. The cake is **Y**. Flour, oven temperature, baking time and the baker's skill are the **X's**. The recipe — how they are combined — is the function **f**. If the cake is dry, you change an ingredient or a setting; you do not inspect the cake more carefully.

The full form is:

$$Y = f(X_1, X_2, \\ldots, X_n) + \\varepsilon$$

The term **ε (epsilon)** is the **error term**: the part of the variation in Y that the listed X's do not explain (unmeasured factors, measurement noise, chance). It is not a mistake by the team.

The book glossary (p. 590) defines **Y** as an output characteristic of a process and **X** as an input characteristic, used together in $Y = f(X)$. The book's table (p. 526) gives the vocabulary:

| Y | X |
|---|---|
| Dependent | Independent |
| Output | Input |
| Effect | Cause |
| Symptom | Problem |
| Monitor | Control |`},{heading:"Monitor Y, control X",body:`The last row of the table is the heart of the strategy. The book (p. 526) asks: to get results, should we focus on Y or on X? Its answer: **control the critical X's in order to control the Y**.

A **critical X** is an input that has a significant influence on one or more key outputs (book glossary, p. 585). The book adds (p. 114): if an X is critical, **by definition you must control it** — and anything you control needs a requirement and a measurement.

Why does chasing Y fail? Imagine a service desk that misses its 4-hour target. Management puts the metric on a wall screen and holds a daily call. For two weeks results improve because people are watched. Then they drift back, because **no X changed** — the same unclear categories, skill gaps and slow vendor hand-off remain. Pressure on Y alone brings short-term effort, workarounds or even **gaming** (closing and reopening tickets to stop the clock).

Treat Y as the **scoreboard**, not the steering wheel.`},{heading:"Three kinds of input: C, P and N",body:`The book (p. 113) tags each input by how much control the team has:

- **Controllable (C)** — can be adjusted while the process runs. *Examples:* speed, feed rate, temperature, number of engineers on the night shift.
- **Procedural (P)** — comes from a standard set of activities. *Examples:* a fixed data-entry form, a set-up routine, an escalation checklist. Controlled through documents and training — if people follow them.
- **Noise (N)** — things we cannot control, do not know about, or find too costly to control. *Examples:* ambient temperature, humidity, weather causing fibre cuts, the individual operator.

The book warns that even "controllable" inputs are **never under complete control**.

Noise is still worth knowing. You cannot stop a storm, but you can make the process **robust** to it, for example by placing spare parts before the rainy season.`},{heading:"Potential causes versus proven root causes",body:`In **Define** the team scopes the **Y** and may **list candidate X's** — from customer feedback, the people who do the work, or a high-level process view. These are **potential causes**: hypotheses only.

A **root cause** is an X that has been **verified with data**: changing it really changes Y. That proof comes in **Measure** (reliable data on Y and the X's) and **Analyze** (testing which X's matter).

| | Potential cause | Verified root cause |
|---|---|---|
| Phase | Listed in Define; prioritised in Measure | Proven in Analyze |
| Evidence | Opinion, brainstorming, experience | Data, graphs, statistical tests |
| Language | "We suspect…" | "Data show that…" |
| Safe action | Investigate and measure | Improve and control |

Jumping from a suspected cause straight to a fix is called **solution jumping**. It feels fast, but it often fixes the wrong thing.`},{heading:"The funnel: from the trivial many to the vital few",body:`The book (p. 240) pictures DMAIC as a **funnel**. At the wide top are **the many X's** (the "trivial many"). In Define, process mapping finds all the possible X's. In Measure, the process map, X-Y matrix and FMEA narrow them to the **probable** X's. Analyze tests them and leaves the **vital few**. Improve and Control set and hold the vital few.

The book's strategy funnel (p. 474) gives the tool order: SIPOC → VOC → project scope → process map, X-Y matrix, FMEA, capability → box plots, scatter plots, regression → fractional factorial → full factorial designs.

| Stage | Question | X's (illustration) |
|---|---|---|
| Define | What could affect Y? | Many (20–50) |
| Measure | Which look likely and measurable? | Fewer (8–15) |
| Analyze | Which are proven? | Vital few (2–5) |
| Improve / Control | Best settings, and how to hold them? | Controlled |

The book's three main sources of X's (p. 118): **process mapping, fishbone analysis and basic data analysis**.`}],keyPoints:["$Y = f(X) + \\varepsilon$: the output is a function of the inputs plus unexplained variation.","Y = dependent, output, effect, symptom, **monitor**. X = independent, input, cause, problem, **control**.","To control Y, find and control the **critical X's**.","Input types (book p. 113): Controllable, Procedural, Noise.","Define lists **potential** X's; Analyze **verifies** root causes.","The funnel narrows the trivial many X's to the vital few.","ε is unexplained variation, not a calculation error."],examTips:['An option saying Define "identifies the root cause" is wrong — root causes are proven in Analyze.',`"What should the team focus on to improve Y?" — the inputs (X's), not more inspection or reporting of Y.`,'Stems may describe variables in words: "response/outcome" = Y (dependent); "factor/input" = X (independent).','A noise input example (weather, humidity) is often offered as "controllable" — read carefully.']},{topic:"1.1.5",title:"Voice of the Customer, Business and Employee",...f,intro:"A good project listens to **three voices**: the **customer** (VOC — what the receiver of the output needs), the **business** (VOB — profit, cost, growth, compliance) and the **employee** (VOE — the people who run the process). A fourth voice, the **Voice of the Process (VOP)**, is what the process actually delivers. Six Sigma closes the gap between what is needed and what is delivered.",sections:[{heading:"The three voices and the Voice of the Process",body:`The book glossary (p. 590) gives these definitions in its own words; here they are paraphrased:

- **VOC** — the **expressed and unexpressed** needs, wants and desires of whoever receives the output. Usually turned into **specifications, requirements or expectations**.
- **VOB** — the needs of the business and its key stakeholders: **profitability, revenue, growth, market share**, cost, compliance.
- **VOP** — the actual **performance and capability** of the process, usually shown as efficiency or effectiveness metrics.

The **VOE** (people doing the work: workload, tools, training, safety, morale) is named in the syllabus but has no glossary entry in the book; the academy lesson covers it. Employees often know exactly where the process breaks, because they patch it every day.

| Voice | Who speaks | Example |
|---|---|---|
| VOC | Receivers of the output | "My business line must be back within 4 hours." |
| VOB | Leaders, finance, regulators | "Cut cost per contact by 10% this year." |
| VOE | People doing the work | "The ticket tool needs six screens per update." |
| VOP | The process, through data | "Median restore 3.1 h; 18% exceed 4 h." |`},{heading:"VOC versus VOP: the gap is the problem",body:`VOC says what is **required** (target and limits). VOP says what is **delivered** (data and variation). The book (p. 208) shows capability analysis as a comparison of the two: the customer's **specification limits** are the VOC, and the spread of the process is the VOP.

Keep one more pair apart. **Specification limits** come from the customer (VOC). **Control limits** are calculated from process data and describe process variation — they are VOP and are **unrelated to customer specifications** (book p. 525).

The book (p. 212) lists where specifications come from: **customer requirements (VOC)**, **business requirements** (targets, benchmarks), **compliance requirements** (regulations) and **design requirements**.

Example: customers need restoration within 4 hours (VOC). The process varies from 2 to 9 hours (VOP). The difference between the two voices **is** the project's problem.`},{heading:"Who is the customer? Internal and external",body:`The book glossary (p. 585) says a **customer** is anyone who uses or consumes a product or service, **inside or outside** the organisation.

- **External customer** — outside the company and usually paying: a home broadband user, an enterprise buying a managed network.
- **Internal customer** — inside the company and depending on your output to do their own job: the NOC receives the monitoring team's alerts; billing receives the provisioning team's order data.

Internal chains matter. If provisioning sends incomplete data, billing makes errors, and the **external** customer finally sees a wrong invoice.

The book (p. 112) also says every output should have a requirement. If an output has none, that is **not acceptable** in a well-managed process — you must **ask or negotiate with the customer** what is acceptable.`},{heading:"Capturing the voices",body:`Good teams combine several listening methods.

| Method | Reactive or proactive | Data type |
|---|---|---|
| Complaints, escalations | Reactive | Both |
| Ticket / CRM data, call logs | Reactive | Quantitative |
| Surveys, CSAT, NPS | Proactive | Mostly quantitative |
| Interviews, focus groups | Proactive | Qualitative |
| Gemba — going to where the work is done | Proactive | Qualitative |

**Reactive** sources arrive whether you ask or not. They are cheap but biased toward upset customers. **Proactive** sources are designed by you and reach quieter customers.

**Qualitative** data (words, stories) tells you **what matters and why**. **Quantitative** data (scores, counts, times) tells you **how much and how often**. You need both.

For VOE use staff interviews, pulse surveys and shadowing a shift. For VOB use budgets, strategy plans, contracts, SLA penalty reports and regulations.`},{heading:"From words to requirements, and when voices disagree",body:`Customers speak in **verbatims**; processes need **requirements**. Translate in three steps:

1. **Verbatim:** "I waste my whole day waiting for the technician."
2. **Need:** a short, reliable appointment window.
3. **CTQ:** appointment window ≤ 2 hours, technician on time in ≥ 95% of visits.

Test every requirement with **RUMBA** (book p. 112): **R**easonable, **U**nderstandable, **M**easurable, **B**elievable, **A**chievable. If it fails any letter, it is not a valid requirement and must be negotiated. The same rules apply to supplier requirements (p. 113).

Voices often conflict: customers want 24/7 human support (VOC), the business wants 10% lower cost (VOB), staff cannot cover more night shifts (VOE). Do not just pick a winner. Find the real need beneath the request, **segment** customers, check with data, design for the shared core, and make trade-offs explicit in the charter.`}],keyPoints:["VOC = customer needs (expressed **and** unexpressed), usually turned into specifications.","VOB = business needs: profit, revenue, growth, market share, cost, compliance.","VOE = the employees who run the process: workload, tools, training, morale.","VOP = what the process actually delivers; capability analysis compares VOP with VOC.","Spec limits = VOC; control limits = VOP.","A customer can be internal or external.","RUMBA: Reasonable, Understandable, Measurable, Believable, Achievable."],examTips:["A statement about profit, cost, risk or regulation is **VOB**, even if a customer-facing manager says it.","Do not confuse VOC (requirement) with VOP (performance data).",`"BEST first step to understand customer needs?" — collect the customer's voice directly (interviews, surveys, complaint data), not assume it.`,'"Fast service" offered as a finished requirement fails RUMBA (not measurable or understandable).']},{topic:"1.1.6",title:"Six Sigma Roles & Responsibilities",...f,intro:"A Six Sigma deployment needs clear roles: leaders who **select and support** projects (Sponsor, Champion), experts who **lead and coach** (Master Black Belt, Black Belt, Green Belt), the **Process Owner** who keeps the gain, and support roles such as the **Finance representative**. Exam questions usually ask *who* does a given task.",sections:[{heading:"Leadership: Executive Sponsor and Champion",body:`The **Executive Sponsor** (academy term) is a senior leader who links the improvement programme to strategy: sets priorities, gives resources and visible support, and reviews results across projects.

The **Champion** is closer to the processes. The book glossary (p. 584) says the Champion **recognises, defines, assigns and supports** Six Sigma projects and is **accountable for their results**. In practice the Champion:

- **selects and scopes** projects in line with business priorities;
- **approves the charter** and the team;
- **removes barriers** — budget, data access, politics between departments, a vendor who will not share logs;
- **chairs the tollgate reviews** and decides go, recycle or stop.

On the book's DMAIC roadmap (p. 230), the first step, *identify problem area*, belongs to the **Champion / Process Owner**.

Simple rule: the Sponsor **sets direction and funds**; the Champion **selects, supports and unblocks** individual projects.`},{heading:"The belts",body:`The book glossary (pp. 584–590) describes the belts like this (training times are indicative):

| Role | Training | Time on improvement | Job |
|---|---|---|---|
| **Master Black Belt** | Beyond Black Belt | Usually full-time | Technical go-to expert; teaches and mentors Belts; supports Champions |
| **Black Belt** | About 4 weeks | **Full-time** | Leads larger projects under the direction of a Champion; coaches Green Belts |
| **Green Belt** | About 2 weeks | **Part-time** | Leads smaller-scope projects in their own area; supports Black Belt projects |
| **Yellow Belt** | About 1 week | Occasional | Team member on Green and Black Belt projects; applies ideas in own area |

The syllabus recommends about **16** training hours for Yellow Belt, **80** for Green Belt and **120** for Black Belt.

The book also lists Six Sigma **behaviours** for every player (p. 228): be tenacious and courageous, rigorous and disciplined, make data-based decisions, embrace change and continuous learning, and share best practice — be a **role model**.`},{heading:"The Process Owner: the role that outlives the project",body:`The book glossary (p. 588) says **Process Owners** are responsible for **process performance and resources**. They give support, resources and expertise to projects, and they are **accountable for implementing the solutions** in their process.

Why does this matter? A Belt leads a project for a few months; the process runs for years. In Control, the **control plan is handed to the Process Owner** (book checklist, p. 578). If the owner has not committed to the new way of working, the gain fades as soon as the Belt moves on.

The book (p. 574) repeats a basic change-management idea from Define: involve the people who **work in the process** and keep the **Champion and Process Owner** updated — that gives the greatest chance of success.

A **Process Member** (p. 588) is someone who performs activities in the process. Note the difference: members **do** the work; the owner is **accountable** for it end to end.`},{heading:"Team, stakeholders and the Finance representative",body:`The **project team** (often 4–8 people) brings process knowledge and does much of the mapping, data collection and testing. Members are chosen because they **work in or next to the process**. Many are Yellow Belts.

**Stakeholders** are anyone affected by, or able to affect, the project: customers, IT, HR, the vendor, regulators, other departments. Not all are on the team, but all must be identified and kept informed.

The **Finance representative** gives an **independent evaluation** of the project's **hard and/or soft savings** and supports both Champions and project leaders (book glossary, p. 585). When a project claims "OMR 120,000 saved per year", Finance checks the baseline, the method and whether the money is real.

At the end, the book's Control checklist asks: **do the Champion, the Belt and Finance all agree the project is complete?** (p. 578).`},{heading:"Who does what: a quick summary",body:`| Task | Usually owned by |
|---|---|
| Set strategic priorities, fund the programme | Executive Sponsor |
| Select, scope and assign projects; approve charter | **Champion** |
| Remove cross-functional barriers | **Champion** |
| Lead DMAIC and apply the tools | Black Belt / Green Belt |
| Coach Belts, ensure statistical rigour | Master Black Belt |
| Provide process access; implement and **sustain** solutions | **Process Owner** |
| Collect data, map, test | Team members (often Yellow Belts) |
| Validate financial benefits | Finance representative |

Read it as a sentence: **Champions select and unblock; Belts lead; MBBs coach; Process Owners sustain; Finance validates.**

Example: a vendor refuses to release incident logs, and the Green Belt cannot get the data. The Belt should **escalate to the Champion**, who has the authority to remove the barrier. The Belt does not have that authority across departments.`}],keyPoints:["Champion: recognises, defines, assigns and supports projects; accountable for results; removes barriers.","Black Belt: about 4 weeks of training, **full-time**, leads projects under a Champion.","Green Belt: about 2 weeks of training, **part-time**, leads smaller local projects, supports Black Belts.","Yellow Belt: about 1 week, team member. Master Black Belt: expert, teacher and mentor.","Process Owner: accountable for process performance and for **sustaining** the solution after handover.","Finance representative: independent check of hard and soft savings.","Project closure: Champion, Belt and Finance agree the project is complete."],examTips:['"Who PRIMARILY removes organisational barriers?" — the Champion.','"Who owns the process AFTER the project closes?" — the Process Owner, not the Belt or Champion.',"The MBB advises on project selection; the **Champion** selects and assigns projects.","Full-time vs part-time is a favourite distractor: Black Belt full-time, Green Belt part-time.",'"Which role does NOT normally lead a project?" — Yellow Belt.']},{topic:"1.2.1",title:"Defining a Process",...f,intro:"Before you can improve a process you must agree **what it is**: its name and purpose, where it **starts and stops**, its inputs and outputs, its customers and its **owner**. In Define this is done at a **high level**. Detailed mapping, SIPOC and value stream maps are Measure topics in the syllabus (2.1.2).",sections:[{heading:"What a process is",body:`The book glossary (p. 587) defines a **process** as a set of activities, with a flow of material and/or information, that **transforms inputs into outputs** to make a product, give a service or perform a task. The book (p. 99) puts it simply: a process is a **blending of inputs to produce a desired output**, and each step should **add value as the customer sees it**.

Three ideas matter:

- **Repeatable.** A one-off event (moving a data centre) is a project, not a process. Six Sigma needs repetition, because you can only measure variation in something that happens many times.
- **Transformation.** Something changes: an order becomes an active line; a ticket becomes a restored service.
- **For a customer.** If nobody receives the output, the activity is a candidate for removal.

A process is **not a department**. Departments group people; processes describe how work flows. Most customer processes cross several departments, and the **hand-offs** between them are where delays and errors grow.`},{heading:"The building blocks",body:`Every process has the same anatomy, which you will later meet as the letters of a **SIPOC**:

| Element | Question | Fibre-order example |
|---|---|---|
| **Supplier** | Who provides what we need? | Customer, network inventory, logistics |
| **Input (X)** | What do we use or consume? | Order details, coverage data, router |
| **Process** | What do we do to transform it? | Capture, check, schedule, install, bill |
| **Output (Y)** | What do we hand over? | Active line, first bill |
| **Customer** | Who receives and judges it? | Household or business subscriber |

Two points examiners like. First, customers can be **internal** or **external**. Second, inputs are not only physical: information, skills, procedures, system settings and the environment are inputs too. The book separates **controllable, procedural and noise** inputs (p. 113).

Remember: in the **syllabus**, building a SIPOC and detailed maps belong to **Measure (2.1.2)**. In Define you need only enough of this to agree what the process is and to scope the project.`},{heading:"Boundaries, triggers and the process owner",body:`A **process boundary** is set by two events:

- **Start trigger** — the event that begins the process: "customer submits a fibre order", "an incident is logged".
- **Stop trigger** — the event that proves the output was delivered: "service is live and confirmed by the customer".

Write triggers as **observable events**, ideally with a system timestamp. "When the customer is happy" is not a stop trigger. Good triggers make measurement possible, because **cycle time is the clock between them**.

Boundaries also control scope. Too wide ("from marketing campaign to contract renewal") and the project is unmanageable. Too narrow ("the technician's 40 minutes on site") and you may miss the real cause three steps earlier. The book warns that mapping too small an area risks missing the cause, while too large an area wastes time (pp. 110, 115). Start and end at **natural starting and stopping points**.

Finally, name one **process owner**, accountable for end-to-end performance.`},{heading:"Levels of view and the three versions of a process",body:`The book (p. 102) compares process views to road maps — world, country, city:

| Level | Name | Audience | Content |
|---|---|---|---|
| 1 | Macro process map | Management | 4–8 big steps, minimal detail |
| 2 | Process map | Workers | Steps as performers do them |
| 3 | Micro process map | Improvement | Yields, cycle times, DPU, RTY, VA/NVA |

**Define works at Level 1.** The book (p. 108) says the macro map also shows management the project's scope "so they can adjust their expectations".

The book also warns (p. 100) that every process has **three versions**: what you **think** it is, what it **actually** is, and what it **should** be. The actual process is almost always **larger, harder and more costly** than people think, full of **hidden operations** (checks, rework loops). That is why Measure later maps it in detail.

The book's preferred description of a process (p. 99): a **generic name**, a **process map** showing the workflow, and an **operational description** — a short paragraph saying why the process exists, what it does and its value (p. 112).`},{heading:"Outputs versus outcomes, and a quick example",body:`An **output** is the thing the process hands over: a closed ticket, an activated line. An **outcome** is what the customer experiences as a result: service really restored, the household online on the promised day.

Outputs can look perfect while outcomes are poor. A desk can close 98% of tickets within SLA and still see many reopened incidents, because **closing a ticket is not fixing the problem**. In Define, write down both.

**Example — defining an incident process at Level 1.**

- **Name (verb + noun):** Restore customer service.
- **Purpose:** return the customer's service to normal as fast as possible.
- **Start trigger:** incident logged in the ITSM tool. **Stop trigger:** user confirms service restored.
- **Major steps:** log → classify → diagnose → fix → confirm and close.
- **Output:** resolved incident record. **Outcome:** service working and not reopened within 7 days.
- **Owner:** head of incident management.

Five boxes, two triggers, one owner — enough to scope the project. Forty boxes would be a Measure-phase map.`}],keyPoints:["Process (book p. 587): activities and a flow of material/information that **transform inputs into outputs**.","A process must be **repeatable**; a process is not a department.","Boundaries = observable **start and stop triggers**; cycle time runs between them.","Map levels (book p. 102): Level 1 macro/management, Level 2 worker, Level 3 micro/improvement.","Three versions of a process: what you **think**, what it **actually** is, what it **should** be.","Every process needs one named **process owner**.","Syllabus places SIPOC, detailed mapping and VSM in **Measure 2.1.2**."],examTips:['"Which tool is used FIRST to define the process in Define?" — a high-level description (name, purpose, boundaries, major steps), not a detailed map or VSM.','A start trigger is a process event ("order received"), never "when the team is ready".','"Number of tickets closed" is an **output** count; an outcome measure reflects the customer result.',"The process owner is whoever is accountable end to end — not the manager with the most staff in the process."]},{topic:"1.2.2",title:"Critical to Quality Characteristics (CTQ’s)",...f,intro:'A **CTQ** turns a vague customer need ("I want fast service") into a **measurable characteristic with a target and specification limits** ("first response ≤ 15 minutes"). Without CTQs you cannot define a defect, count defects, set a baseline or prove an improvement.',sections:[{heading:"What a CTQ is",body:`The book glossary (p. 585) defines **Critical to Quality (CTQ)** as any characteristic that is critical to the **perceived quality** of the product, process or system, and links it to a **Significant Y** — an output with a strong influence on the success of the process or the customer (p. 588).

The book (p. 509) gives three steps to develop CTQs:

1. **Identify the customer.**
2. **Capture the Voice of the Customer.**
3. **Validate the CTQs** — go back to the customer and check: "if we hit these numbers, will you be satisfied?"

A **CTQ tree** shows the translation from left to right:

- **Need** (customer words): fast service when my line goes down.
- **Drivers** (what "fast" means): quick first response, quick resolution, kept informed.
- **CTQs** (measurable): first response ≤ 15 min for 95% of P2 incidents; restore ≤ 4 h; status update at least every 60 min.`},{heading:"The parts of a complete CTQ",body:`A complete CTQ has four parts:

| Part | Meaning | Example |
|---|---|---|
| **Characteristic** | What we measure | First response time |
| **Metric / unit** | How it is measured | Minutes from logging to first human response |
| **Target** | The value the customer prefers | 10 minutes |
| **Specification limit(s)** | Edge of acceptable | USL = 15 minutes |

The book (p. 112) says that to measure something it must have a **unit of measure, called a metric**. The **target** is the value the customer would like all output centred on; if the customer gives none, use what the average should be.

**Specification limits** are the bounds of acceptable performance (book p. 589). They can be:

- **one-sided** — response time has only an upper limit (USL); nobody complains the engineer was too early;
- **two-sided** — a callback promised "in 1 hour ± 5 minutes" has target 60, LSL 55 and USL 65.

Any result outside a limit is a **defect** (book p. 585).`},{heading:"Why vague statements fail — RUMBA and operational definitions",body:`"Make incident handling faster" leads each team to optimise its own idea of "fast". The result: no shared target, **no defect definition**, no baseline and no proof of improvement.

The book (p. 112) is clear: an output **without requirements is not acceptable** in a well-managed process; negotiate them with the customer. Test each requirement with **RUMBA** — **R**easonable, **U**nderstandable, **M**easurable, **B**elievable, **A**chievable. "Great service" fails Understandable and Measurable. "Instant fix for every fault" fails Reasonable and Achievable.

Then write an **operational definition**, so that two analysts get the same number:

| Element | First response time (P2) |
|---|---|
| What | Time from P2 logged to first **human** response |
| How | ITSM "created" timestamp to first call or public note |
| Unit | Minutes, one decimal |
| When | Every P2 incident, 24×7 |
| Defect rule | First response > 15.0 minutes |

Hidden questions (does an automatic e-mail count?) are settled **before** measuring.`},{heading:"CTQ, KPI and SLA",body:`These words are related but not the same.

| | CTQ | KPI | SLA |
|---|---|---|---|
| View | The customer's | The organisation's | A contract |
| Purpose | Define "good" for one unit | Track performance over time | Set enforceable promises |
| Form | ≤ 15 min per P2 incident | % of P2 answered within 15 min this month | 95% monthly, or a 2% service credit |

The healthy chain is **VOC → CTQ → KPI → (sometimes) SLA**. The CTQ defines quality for each unit; the KPI adds up CTQ performance across many units; the SLA turns the KPI into a contract.

Problems start when an SLA is written first and never checked against what customers need. A vendor can be 100% SLA-compliant on an automatic acknowledgement e-mail while customers still wait an hour for a human. Meeting the SLA does **not** prove the CTQs are met.

CTQs are the **Y's** in $Y = f(X)$; Measure and Analyze then look for the X's that drive them.`},{heading:"Worked example: is the CTQ met?",body:`In one month there were **400** P2 incidents. **372** got a human first response within 15.0 minutes. The CTQ requires **95%** compliance.

**Compliance rate:**

$$\\text{Compliance} = \\dfrac{372}{400} = 0.93 = 93\\%$$

**Defects** (incidents outside the limit): $400 - 372 = 28$.

**DPU** (one opportunity per incident for this CTQ):

$$\\text{DPU} = \\dfrac{28}{400} = 0.07$$

**Decision:** 93% is below 95%, so the CTQ is **not met**. To reach 95%, at most $400 \\times 0.05 = 20$ incidents may fail, so the gap this month is $28 - 20 = 8$ incidents.

**Common mistake:** "The average first response was 9 minutes, below the 15-minute limit, so the CTQ is met." A CTQ is judged **unit by unit** against its limit. A good average can hide 28 customers who waited too long.`}],keyPoints:["CTQ = a characteristic critical to the customer's perceived quality (book p. 585).","CTQ steps (book p. 509): identify the customer → capture VOC → validate the CTQs.","A complete CTQ = characteristic + metric/unit + target + specification limit(s).","Spec limits (LSL, USL) can be one-sided or two-sided; outside a limit = **defect**.","Test requirements with **RUMBA**; make them unambiguous with an **operational definition**.","Chain: VOC → CTQ → KPI → SLA. Meeting an SLA does not guarantee the CTQ is met."],examTips:[`"Which is a CTQ?" — choose the option with a measure and a limit, not the customer's words ("reliable service").`,'"What is done FIRST when developing CTQs?" — identify the customer, not set the spec limits.','An "improve response by 20%" statement is a project goal, not a CTQ (no unit, no limit, no defect rule).',"The most complete operational definition includes **how** it is measured and the **defect rule**."]},{topic:"1.2.3",title:"Cost of Poor Quality (COPQ)",...f,intro:"The **Cost of Poor Quality (COPQ)** is the money lost because work is **not done right the first time**: rework, scrap, repeat visits, penalties, complaints and lost customers. In Define, a COPQ estimate shows **whether the problem is worth solving** and feeds the business case.",sections:[{heading:"Definition, and COQ versus COPQ",body:`The book glossary (p. 584) defines COPQ as the costs of **any activity that is not doing the right thing right the first time** — the money value of waste that is not part of the product or service you sell.

Two totals are often confused:

- **Cost of Quality (COQ)** — the **total** cost linked to quality, in four categories: **prevention (P)**, **appraisal (A)**, **internal failure (IF)** and **external failure (EF)**.
- **Cost of Poor Quality (COPQ)** — the part caused by **failure**.

$$\\text{COPQ} = \\text{IF} + \\text{EF}$$

$$\\text{COQ} = \\text{P} + \\text{A} + \\text{IF} + \\text{EF}$$

Prevention and appraisal are the **cost of good quality** (cost of conformance). Failure costs are the **cost of non-conformance**.

**Convention note:** some authors also count appraisal in COPQ. On the exam, use the common convention (**failure costs only**) unless the question says otherwise, and in your own business case state which convention you used.`},{heading:"The four categories",body:`Remember the life of a defect: **prevent it → detect it → fix it before the customer sees it → suffer it after the customer sees it.**

| Category | What it is | Service examples |
|---|---|---|
| **Prevention** | Spending to stop defects happening | Training, error-proofing order forms, design reviews, better data |
| **Appraisal** | Spending to find defects by checking | QA audits, test calls, invoice checks, inspection, calibration |
| **Internal failure** | Defects found **before** the customer | Rework, re-keying, scrap, overtime to clear backlogs |
| **External failure** | Defects found by or affecting the **customer** | SLA credits, repeat truck rolls, complaints, warranty, refunds, churn |

The test for internal versus external is **who found it, or whom it affected** — not where it was fixed. A wrong speed profile caught by a pre-activation check is **internal** failure. The same error found by the customer is **external** failure.

External failures almost always cost more: they add customer handling, penalties and the risk of losing the customer. The book's Define quiz answer key confirms the category name **"Internal Failure Costs"** is examined.`},{heading:"The hidden factory and the iceberg",body:`Picture an **iceberg**. Above the water are costs with their own accounting line: scrap, warranty, SLA credits. Below the water is a much bigger mass that nobody costs.

The book glossary (p. 586) calls this the **hidden factory**: corrective, non-value-added work that is **not recognised** as waste. **Rework** is the activity needed to correct defects (p. 588). In a service company the hidden factory includes:

- engineers revisiting jobs that should have been right first time;
- back-office staff correcting order data;
- agents chasing other teams for updates;
- duplicate tickets, reopened incidents and manual workarounds;
- managers in daily escalation calls.

None of this has an invoice; it is paid through normal salaries and overtime, so it looks like ordinary work. The book (p. 100) adds that the actual process is almost always **bigger and more costly** than people think, full of "hidden operations".

Deeper still are real but hard-to-measure costs: churn, lost referrals, reputation, burnout. Estimate them, state your assumptions and agree the method with Finance.`},{heading:"Why prevention lowers total cost",body:`A well-known rule of thumb, **1–10–100**: a defect that costs 1 to prevent may cost 10 to fix inside the company and 100 once it reaches the customer. The exact ratios are illustrative, but the direction is reliable: **moving effort upstream is cheaper**.

As a quality programme matures, a typical pattern appears:

- **prevention** spending rises a little;
- **appraisal** can then fall;
- **failure** costs fall a lot;
- so **total COQ falls**.

The opposite strategy — adding more inspectors at the end — raises appraisal cost but leaves the cause in place. Defects are found more often, but they are still made.

Six Sigma's logic, fixing the X's in $Y = f(X)$, is a **prevention** strategy. On the DMAIC roadmap, **"Estimate COPQ" is a Define step** (book p. 230), and the Measure checklist asks "Have you identified more COPQ?" (p. 231): the first estimate is refined as you learn.`},{heading:"Worked example: COPQ and COQ",body:`A fulfilment unit's monthly costs (OMR) are grouped:

| Category | Items | Total |
|---|---|---|
| Prevention | Training 12,000 + error-proofing 8,000 | 20,000 |
| Appraisal | QA audits 18,000 + test calls 12,000 | 30,000 |
| Internal failure | Re-provisioning 50,000 + scrapped routers 15,000 + backlog overtime 20,000 | 85,000 |
| External failure | SLA credits 60,000 + repeat truck rolls 45,000 + complaints 25,000 + warranty 35,000 | 165,000 |

$$\\text{COPQ} = 85{,}000 + 165{,}000 = 250{,}000$$

$$\\text{COQ} = 20{,}000 + 30{,}000 + 85{,}000 + 165{,}000 = 300{,}000$$

$$\\text{Failure share} = \\dfrac{250{,}000}{300{,}000} = 0.833 = 83.3\\%$$

So COPQ is **OMR 250,000 a month**. Spending is heavily on failure, a sign of too little prevention.

**Trap:** adding all four categories (300,000) and calling it COPQ — that is total COQ.

**Single-line estimate:** 1,200 installations a month, 9% need a repeat visit at OMR 35 each: $1{,}200 \\times 0.09 = 108$ visits, $108 \\times 35 = 3{,}780$ a month, $3{,}780 \\times 12 = 45{,}360$ OMR a year.`}],keyPoints:["COPQ (book p. 584): the cost of **not doing the right thing right the first time**.","Four categories: Prevention, Appraisal, Internal failure, External failure.","Common convention: **COPQ = IF + EF**; **COQ = P + A + IF + EF**.","Internal vs external: decided by **who found the defect / whom it affected**.","Hidden factory = corrective work nobody recognises as waste.","Investing in prevention lowers total cost of quality.",'"Estimate COPQ" is a **Define** step on the DMAIC roadmap.'],examTips:['Given P, A, IF and EF, "COPQ" = IF + EF. Summing all four gives COQ — a tempting wrong answer.',"Customer complaint handling, warranty, SLA credits → **external** failure. Scrap and rework before delivery → **internal**.",'"Which is NOT a cost of poor quality?" — training (prevention).','"BEST long-term way to cut total quality cost?" — invest in prevention, not more final inspection.']},{topic:"1.2.4",title:"Pareto Analysis (80:20 rule)",...f,intro:"**Pareto analysis** ranks problem categories from biggest to smallest so the team can focus on the **vital few** that cause most of the trouble. The famous **80:20 rule** says roughly 80% of effects come from roughly 20% of causes — but it is a rule of thumb, not a law. A Pareto chart shows **where to look**, not **why** it happens.",sections:[{heading:"The Pareto principle",body:`The book glossary (p. 587) says the **Pareto principle**, first proposed by **Vilfredo Pareto (1848–1923)**, states that **most of the influence on an outcome comes from a minority of input factors**. Pareto studied wealth in Italy; quality pioneer **Joseph Juran** applied the idea to quality and called it the "vital few and trivial many".

Treat 80:20 as a **rule of thumb**. Real data may give 70:30, 90:10 or 79:43. The split changes with:

- **how you define the categories** — merging or splitting bars changes the shape;
- **the time period** — one bad week can dominate a month;
- **what you measure** — frequency (how often) or impact (how much it hurts).

The two numbers need **not** add up to 100. "79% of tickets come from 43% of categories" compares two different totals.

Memory hook: Pareto is a **spotlight**, not a verdict.`},{heading:"Building the chart",body:`The book glossary (p. 587) defines a **Pareto chart** as a bar chart for **attribute (categorical) data**, with categories shown in **descending order of frequency**. A cumulative-percentage line is added.

Steps:

1. **Tally** each category over a defined period, with a clear operational definition of each category.
2. **Sort** from largest to smallest. Put **"Other" last**, even if it is larger than a small named bar.
3. **Total** all counts.
4. **Percentage** of each category.
5. **Cumulative count** — a running sum down the sorted list.
6. **Cumulative %** — the last value must be exactly 100% (a quick self-check).

The chart has **two vertical axes**: counts on the **left**, cumulative % (0–100%) on the **right**. The line always rises and flattens, because each new bar is smaller than the one before.

Compare with similar charts (book glossary): a **bar chart** shows categories in any order; a **histogram** shows numerical (measurement) data. Descending order of categories is what makes a Pareto chart.`},{heading:"Worked example: cumulative percentage",body:`A service desk logs **1,000** tickets in a month:

| Rank | Category | Count | Cumulative count | Cumulative % |
|---|---|---:|---:|---:|
| 1 | Access & password | 380 | 380 | 38% |
| 2 | Network | 260 | 640 | 64% |
| 3 | Billing system | 150 | 790 | 79% |
| 4 | Email | 80 | 870 | 87% |
| 5 | Hardware | 60 | 930 | 93% |
| 6 | Printing | 40 | 970 | 97% |
| 7 | Other | 30 | 1,000 | 100% |

The cumulative % for the top three categories:

$$\\text{Cumulative \\%} = \\dfrac{380 + 260 + 150}{1{,}000} \\times 100 = \\dfrac{790}{1{,}000} \\times 100 = 79\\%$$

So **3 of 7 categories** (about 43%) cause **79%** of tickets. That is Pareto-shaped, though not exactly 80:20 — which is normal. To pass 90%, you need **five** categories (93%).

**Common mistake:** averaging the top three percentages (38, 26 and 15 give 26.3). A cumulative percentage is a **running sum**, not an average.`},{heading:"Reading the cut-off, and the weighted Pareto",body:`Look at the **shape** of the line:

- a steep line with a sharp **bend (elbow)** → a clear vital few; focus there;
- a flat, nearly straight line → problems are spread evenly; try a different grouping (by cause, location, shift) before prioritising.

The cut-off is a **judgement**, not an automatic 80% line. If a cheap fix exists for category 4, the team and Champion may tackle it early.

Counting treats a 2-minute password reset like a 6-hour network investigation. When severity differs, build a **weighted Pareto**: multiply each count by an impact weight (hours, cost, customers affected). With average effort per ticket of Access 0.25 h, Network 3 h and Billing 2 h:

- Access: $380 \\times 0.25 = 95$ hours
- Network: $260 \\times 3 = 780$ hours
- Billing: $150 \\times 2 = 300$ hours

Now **Network** ranks first, and Access drops to third. Neither chart is "right": frequency suits annoyance and self-service; weighted suits cost, COPQ or staffing. State which one you used.`},{heading:"Second-level Pareto and common mistakes",body:`A top bar such as "Network" is usually a **symptom bucket**. You cannot act on "network". So **stratify**: build a second Pareto of the biggest bar's contents (router configuration 104, DNS 65, VPN 39, …). Now the team has a narrow, measurable focus for a problem statement.

Even then, remember the limit: a Pareto shows **where problems cluster**, not **why**. Proving a root cause needs Analyze tools. The book (p. 124) also uses Pareto ranking in FMEA to decide where corrective action is taken first.

Common mistakes:

- **Unsorted bars** — alphabetical order is just a bar chart.
- **"Other" in the wrong place** — it belongs at the far right.
- **Mixed category types** — a cause, a time and a location on one chart; categories must not overlap.
- **Mixed periods or units.**
- **Reading the wrong axis** — cumulative % is on the **right**.
- **Treating Pareto as proof** of a root cause.
- **Forcing exactly 80:20.**
- **Never re-running it** after improvement — a new top bar often appears.`}],keyPoints:["Pareto principle (book p. 587, Vilfredo Pareto 1848–1923): a minority of factors causes most of the effect.","Juran applied it to quality: the **vital few** and the trivial many.","Pareto chart = categorical data in **descending** order + cumulative % line.",'Put "Other" last; cumulative % must end at exactly 100%.',"Counts on the left axis, cumulative % on the right axis.","80:20 is a rule of thumb; the split varies and need not add to 100.","Pareto **prioritises**; it never proves a root cause."],examTips:['"Cumulative % of the top two categories?" — read the **line** (running sum), not the height of bar 2.','"FIRST step in building a Pareto chart?" — collect and tally the data by category.',"A chart in alphabetical or time order is **not** a Pareto chart.",'"Which statement is NOT true?" — "the split is always exactly 80/20".','An option saying Pareto "identifies the verified root cause" is wrong.']},{topic:"1.2.5",title:"Basic Six Sigma Metrics: DPU, DPMO, FTY, RTY, Cycle Time",...f,intro:"These are the numbers every Green Belt must calculate quickly and correctly: **DPU** (defects per unit), **DPMO** (defects per million opportunities), **FTY** (first time yield), **RTY** (rolled throughput yield) and **cycle time**. Almost every mistake comes from picking the wrong **numerator** or **denominator**, so learn the vocabulary first.",sections:[{heading:"Unit, defect, defective, opportunity",body:`- **Unit** — the item you count: one invoice, one SIM activation, one ticket.
- **Defect** — any failure to meet a requirement (book glossary p. 585).
- **Defective** — a unit with **at least one** defect. One invoice with two errors = **2 defects, 1 defective**.
- **Opportunity** — a characteristic of the unit that can be judged acceptable or not (book glossary p. 587). Each is a chance for a defect.

A good opportunity is **measurable** (clear pass/fail rule), **customer-relevant** (linked to a CTQ) and **consistent** (same list for every unit and period).

Warning: adding trivial opportunities makes the denominator bigger and DPMO look better, with no real improvement. Agree the list in Define and do not change it.

**Running example:** 500 SIM activations, 6 opportunities each, **45 defects** found on **38 activations**.`},{heading:"DPU and percentage defective",body:`The book glossary (p. 585): **DPU** is the total number of defects found in some number of units **divided by** the number of those units.

$$\\text{DPU} = \\dfrac{\\text{total defects}}{\\text{total units}} = \\dfrac{45}{500} = 0.09$$

**Percentage defective** answers a different question — how many **units** are bad:

$$\\%\\ \\text{defective} = \\dfrac{\\text{defective units}}{\\text{total units}} = \\dfrac{38}{500} = 0.076 = 7.6\\%$$

**Key differences:**

- DPU uses **defects** (45); % defective uses **defective units** (38).
- DPU **can be greater than 1**. Eight routers with 12 defects give

$$\\text{DPU} = \\dfrac{12}{8} = 1.5$$

while % defective can never exceed 100%.

**Trap:** the stem gives both numbers. "Defects found" → DPU; "units with defects" → % defective.`},{heading:"DPO and DPMO",body:`DPU ignores complexity: a 40-field order has more chances to go wrong than a 3-field password reset. Dividing by **opportunities** makes processes comparable.

$$\\text{DPO} = \\dfrac{D}{U \\times O} = \\dfrac{45}{500 \\times 6} = \\dfrac{45}{3{,}000} = 0.015$$

The book glossary (p. 585): **DPMO** is total defects divided by total opportunities, expressed **per million**:

$$\\text{DPMO} = \\dfrac{D}{U \\times O} \\times 10^{6} = 0.015 \\times 10^{6} = 15{,}000$$

**Shortcut:** DPO is DPU shared out over the opportunities per unit:

$$\\text{DPO} = \\dfrac{\\text{DPU}}{O} = \\dfrac{0.09}{6} = 0.015$$

**Wrong answers to recognise:**

- DPU × 10⁶ = 90,000 → that is defects per million **units** (forgot the opportunities).
- Using defectives (38) in the numerator → undercounts.
- Adding units and opportunities (500 + 6) → meaningless; they must be **multiplied**.

**Conversion:** to turn DPMO into a % of opportunities, use $15{,}000 \\times 10^{-4} = 1.5\\%$ — not 15%.`},{heading:"FTY and final yield",body:`**First time yield (FTY)**, also called first pass yield, counts units that pass a step **right first time** — no rework, no repair, no scrap. **Final yield** counts units that are good **in the end**, including reworked ones.

**Example:** 1,200 tickets. 1,020 resolved first time and never reopened. 150 reopened (rework) and later resolved. 30 cancelled and re-raised (scrap).

$$\\text{FTY} = \\dfrac{1{,}020}{1{,}200} = 0.85 = 85\\%$$

$$\\text{Final yield} = \\dfrac{1{,}020 + 150}{1{,}200} = \\dfrac{1{,}170}{1{,}200} = 0.975 = 97.5\\%$$

The **12.5-point gap** (150 reworked tickets) is the **hidden factory** — pure cost of poor quality.

**Word clues:** "without rework", "first pass", "right first time" → **FTY**. "Eventually", "after repair", "shipped" → **final yield**.

**Trap:** FTY = 97.5%. That counts reopened tickets as first-time successes.

Note: the supplied book does not define FTY in its glossary; this definition follows the academy lesson and common exam usage.`},{heading:"RTY: rolled throughput yield",body:`The book glossary (p. 588): **RTY** is the **probability that a unit passes through all process steps with zero defects**. Because a unit must pass step 1 **and** step 2 **and** step 3, the step yields **multiply**:

$$\\text{RTY} = \\text{FTY}_1 \\times \\text{FTY}_2 \\times \\cdots \\times \\text{FTY}_n$$

**Example:** four provisioning steps with FTY 97%, 95%, 88% and 93%:

$$\\text{RTY} = 0.97 \\times 0.95 \\times 0.88 \\times 0.93 = 0.7542 \\approx 75.4\\%$$

Only about 75 of 100 orders go end to end without being touched twice, though no single step is worse than 88%.

The book's value stream map (p. 105) shows the same effect: $0.92 \\times 0.94 \\times 0.59 \\times 0.96 \\times 0.96 \\approx 0.47$. One weak step (0.59) drags the whole stream below 50%.

**Traps:** the **average** (93.25%), the **lowest step** (88%) and the **last step** (93%) are all wrong. RTY is always a **product**, and it is always **≤ the lowest step yield**. Convert percentages to decimals before multiplying.`},{heading:"Cycle time",body:`The book glossary (p. 585): **cycle time** is the total time from when a task, product or service is **started until it is completed**. As an average for a step or team:

$$\\text{Cycle time} = \\dfrac{\\text{net working time}}{\\text{units completed}}$$

**Example:** a desk has 7 h 30 min of net working time and completes 225 orders. First convert to **one unit**: $7 \\times 60 + 30 = 450$ minutes.

$$\\text{Cycle time} = \\dfrac{450}{225} = 2 \\text{ min per order} = 120 \\text{ s}$$

**Trap:** writing 7 h 30 min as "7.30". It is **7.5 hours**. Always convert first and **state the unit**.

**Second example:** 18 installations over 3 days of 7.5 net hours: $3 \\times 7.5 \\times 60 = 1{,}350$ minutes.

$$\\text{Cycle time} = \\dfrac{1{,}350}{18} = 75 \\text{ min}$$

(The answer 1.25 is correct only if labelled **hours**.)

Related ideas (supplementary): **lead time** is the total time the customer waits, including queues; **takt time** is available time shared by customer demand. Cycle time must be ≤ takt time to keep up with demand.`},{heading:"Numerator and denominator checklist; DPMO to sigma",body:`| Metric | Numerator | Denominator |
|---|---|---|
| DPU | Total **defects** | Total **units** |
| % defective | **Defective units** | Total **units** |
| DPO / DPMO | Total **defects** | **Units × opportunities** (× 10⁶ for DPMO) |
| FTY | Units right **first time** | Units **entering** |
| Final yield | Good units incl. reworked | Units **entering** |
| RTY | Product of step FTYs | — |
| Cycle time | Net working **time** | Units **completed** |

**DPMO and sigma level.** Lower DPMO means a higher sigma level. Using the conventional **1.5σ shift**, the book's table (p. 223) gives 66,807 DPMO ≈ 3σ, 6,210 ≈ 4σ, 233 ≈ 5σ and 3.4 ≈ 6σ. The running example (15,000 DPMO) sits at about **3.67σ**. The exam gives you the tables; you do not compute the normal curve by hand.

**Poisson link (advanced).** When defects are random, the chance of a unit with zero defects is about $Y \\approx e^{-\\text{DPU}}$. With DPU = 0.09, $e^{-0.09} \\approx 0.914$, close to the observed FTY of 0.924.`}],keyPoints:["DPU can exceed 1: $$\\text{DPU} = \\dfrac{\\text{defects}}{\\text{units}}$$","DPMO divides by **all** opportunities: $$\\text{DPMO} = \\dfrac{\\text{defects}}{\\text{units} \\times \\text{opportunities}} \\times 10^{6}$$","% defective uses defective **units**, not defects.","FTY excludes anything reworked or scrapped; final yield includes reworked units.","RTY = **product** of step FTYs; always ≤ the lowest step yield.","Convert to one time unit first: $$\\text{Cycle time} = \\dfrac{\\text{net working time}}{\\text{units completed}}$$","Lower DPMO = higher sigma level; 3.4 DPMO = 6σ (with the 1.5σ shift)."],examTips:['The stem often gives both defects and defective units: DPU and DPMO use **defects**; "% defective" uses **units**.','"Per opportunity" or "per million opportunities" → divide by units **×** opportunities.',"RTY options include the average and the lowest step — both wrong; multiply.",'"Without rework / first pass" → FTY. "Which yield is LEAST affected by rework?" → final yield.','Time traps: "7 h 30 min" is 450 min, not 7.30; label the unit of your answer.']},{topic:"1.3.1",title:"Building a Business Case & Project Charter",...f,intro:"The **business case** explains why a problem deserves a project **now**. The **project charter** is a one-page agreement that states the business case, **problem statement**, **goal statement**, **scope**, team, milestones and sponsor sign-off. The most tested skill is spotting a weak problem statement — one that hides a **cause or a solution**.",sections:[{heading:"The business case: why this, why now",body:`A business case is a short, evidence-based argument. It answers four questions:

1. **Why this problem?** What is the measurable pain — customer, cost, risk, capacity? Use VOC and VOB data.
2. **Why now?** A contract renewal, a rising trend, a regulatory deadline?
3. **What if we do nothing?** Penalties keep growing, customers leave, the backlog grows.
4. **How does it link to strategy?** Which business goal or KPI does it move?

Example: *Service credits for restoration SLA breaches have risen for three quarters and are now our largest enterprise revenue leak. Two of our five largest accounts renew next year and have raised restoration in reviews.* It quantifies the pain, explains the urgency and links to retention — **without proposing a fix**.

The business case usually carries the early **COPQ estimate** (a Define step on the book's roadmap, p. 230). It is not filed and forgotten: the book's Control checklist (p. 578) asks whether the results match **the requirements of the business case and improvement goals**.`},{heading:"Anatomy of a project charter",body:`A charter is normally **one page**. If the project cannot fit on one page, it is probably too big or not yet understood.

| Element | Its job |
|---|---|
| Business case | Why it matters, why now |
| **Problem statement** | What is wrong, where, when, how big, impact |
| **Goal statement** | The measurable result and the date |
| **Scope** (in / out) | The process boundaries |
| Milestones | Target dates for each DMAIC tollgate |
| Team and roles | Belt, members, process owner, experts |
| Sponsor / Champion | Owns the result; signs; removes barriers |
| Stakeholders | Who must be informed or consulted |
| Risks, assumptions, constraints | What could derail the project |
| Preliminary benefits | **Estimated** gain, to be validated later |

Keep three words apart. A **risk** is an uncertain event that could hurt the project (*the vendor may not release data in time*) — it needs mitigation. An **assumption** is something treated as true without proof (*priority codes are applied consistently*) — it needs checking. A **constraint** is a fixed limit (*no new headcount*) — it must be respected.`},{heading:"Writing the problem statement",body:`The book glossary (p. 587) calls a **problem statement** a short statement of a business situation that **bounds and describes** the problem the project will solve. A good one answers **what, where, when, how big and what impact** — and contains **no cause, no solution, no blame**.

> In Q2 2026, 225 of 1,250 P1/P2 enterprise incidents (18%) in the Northern region were restored after the 4-hour SLA, causing OMR 45,000 in service credits and two customer escalations.

The baseline rate:

$$\\text{Breach rate} = \\dfrac{225}{1{,}250} = 0.18 = 18\\%$$

**Disguised solutions** sound like problems but already contain the answer. Warning words: *lack of, need to, insufficient, should implement*, a named tool, extra headcount, or "due to / because of".

| Weak (disguised solution) | Strong |
|---|---|
| "We lack an automated routing tool." | "Since January, 31% of P2 incidents waited > 45 min for assignment, against a 15-min target." |
| "Field teams need more splicing training." | "In 6 months, 14% of fibre repairs in the East needed a repeat visit within 7 days." |

A disguised solution **skips Measure and Analyze**: the team builds the tool even if the real cause is something else.`},{heading:"The goal statement and SMART",body:`The book calls it an **objective statement**: a short statement of the **goals, timing and expectations** of the project (glossary p. 587). It uses the **same metric** as the problem statement, then adds the target and the date. Make it **SMART**: Specific, Measurable, Achievable, Relevant, Time-bound.

> Reduce the share of Northern-region P1/P2 enterprise incidents restored after the 4-hour SLA from 18% to 6% by 31 March 2027, without increasing the repeat-incident rate.

The goal says **what**, not **how** — the method comes from Analyze and Improve. The last clause protects a guard-rail (secondary) metric.

How ambitious is it? The relative improvement is:

$$\\text{Improvement} = \\dfrac{18 - 6}{18} \\times 100 = 66.7\\%$$

The book glossary (p. 584) calls **breakthrough improvement** a gain **at or near 70% over baseline**, so this goal is close to breakthrough level.

**Trap:** "18% − 6% = a 12% improvement". It is a **12 percentage-point** reduction, but a **66.7%** improvement.`},{heading:"Scope, scope creep and the living charter",body:`**Scope** draws a fence around the project. Define it as a process with a start and an end, then list what is **in scope** and **out of scope**. Example: in scope — enterprise invoices from bill run to dispute closure; out of scope — consumer prepaid, tariff design, replacing the billing platform.

**Scope creep** is the slow, unapproved growth of a project ("while you look at disputes, could you also fix the collections letters?"). Each addition looks small, but together they dilute effort and delay the finish. The defence is the charter: any scope change is a **formal decision by the Champion**, recorded in a new charter version.

Common charter mistakes:

- a solution or cause in the problem statement;
- a goal with no baseline or no date;
- different metrics in the problem and goal statements;
- "boil-the-ocean" scope;
- no real sponsor signature;
- benefits stated as fact before validation.

The charter is a **living document**. The book's Measure checklist asks "Has the Problem Statement changed?" (p. 231). Update it openly at tollgates; never let it drift silently.`}],keyPoints:["Business case answers: why this, why now, cost of doing nothing, link to strategy.","Charter elements: business case, problem, goal, scope, milestones, team, sponsor, stakeholders, risks, estimated benefits.","Problem statement = what, where, when, how big, impact — **no cause, no solution, no blame**.","Goal (objective) statement uses the same metric + target + date; make it SMART.","Breakthrough improvement (book p. 584) ≈ 70% over baseline.","Scope changes are formal Champion decisions; uncontrolled growth = scope creep.","The charter is a living document, reviewed at every tollgate."],examTips:['"BEST problem statement?" — the one with data (what/where/when/how big) and no action verb like implement, hire, train, install.','Any "due to", "because of" or "caused by" in a Define problem statement is a red flag.','"Which is NOT a charter element?" — a verified root cause, a selected solution or a control plan.',"Percentage points vs percent: 18% → 6% is 12 points but a 66.7% improvement.","Sponsor asks to add a second process — assess impact and take a formal charter change to the Champion; do not just absorb it."]},{topic:"1.3.2",title:"Developing Project Metrics",...f,intro:"Project metrics tell you where you start (**baseline**), what you are trying to move (**primary metric**), what must not get worse (**secondary metrics**) and how far you aim to go (**target**). Good metrics are clearly defined, use fair units and trace back to a CTQ.",sections:[{heading:"Metrics and the baseline",body:`The book glossary (p. 587) defines a **metric** as a measure seen as a **key indicator of performance**, linked to goals or objectives and carefully monitored.

A **baseline** is current performance, measured **before** any change. Without it, nobody can prove the project made a difference. Three decisions build a credible baseline:

1. **Operational definition** — what exactly counts? Does the restore clock start at the alarm, the ticket or the customer call? Does it stop at "service restored" or "ticket closed"?
2. **Period** — long enough to include normal variation: busy and quiet weeks, month-ends, shifts. The book (p. 213) says always use **long-term data** to report the baseline. One good week is not a baseline.
3. **Data source** — which system, which population, which exclusions.

**Example:** in six months, 20,400 of 24,000 supplier invoices passed with no query or correction.

$$\\text{Baseline FTY} = \\dfrac{20{,}400}{24{,}000} = 0.85 = 85\\%$$

Using one quiet week (98%) would overstate performance.`},{heading:"Primary and secondary metrics",body:`The **primary metric** is the single measure that best represents the charter problem — the project **Y**. It should be the same metric used in the problem and goal statements. The book (p. 116) advises solving **one output at a time**; chasing several Y's at once becomes overwhelming.

**Secondary metrics** are **guard-rails**. They watch for side effects that would make the "improvement" false.

- Goal: cut mean time to restore → guard-rail: **repeat-incident rate** (fast workarounds could cause repeat failures).
- Goal: process invoices faster → guard-rail: **invoice accuracy**.

The book treats these two as constant companions. Every phase report lists "Primary Metric" and "Secondary Metric(s)" (pp. 229, 416, 488). Its Control checklist asks whether the project improved the primary metric **without compromising the secondary metrics** (p. 574). Building the X-Y matrix may even show you need to add a secondary metric or refine the primary one (p. 120).`},{heading:"Outcome, process and financial metrics; leading and lagging",body:`Group metrics by what they describe:

- **Outcome metrics** — results the customer or business feels: SLA compliance, first-contact resolution, churn.
- **Process metrics** — how the work is done: time to first assignment, % of tickets with a complete fault description.
- **Financial metrics** — performance in money: service credits paid, cost per repair, cost of rework.

A second lens is **timing**:

- A **lagging indicator** tells you what already happened (monthly SLA compliance arrives after the month ends).
- A **leading indicator** moves **before** the outcome and gives early warning (P1 tickets still unassigned after 15 minutes predict breaches later that day).

Outcome metrics usually lag; process metrics usually lead. Good projects pair them: the **primary metric is usually an outcome**, and process metrics help the team steer between monthly reports.`},{heading:"Fair units: normalise before you compare",body:`Raw counts mislead when volume changes. Complaints rose from 1,800 to 1,900 while subscribers grew from 120,000 to 152,000. Normalise per 1,000 subscribers:

$$\\text{H1 rate} = \\dfrac{1{,}800}{120{,}000} \\times 1{,}000 = 15.0$$

$$\\text{H2 rate} = \\dfrac{1{,}900}{152{,}000} \\times 1{,}000 = 12.5$$

$$\\text{Improvement} = \\dfrac{15.0 - 12.5}{15.0} \\times 100 = 16.7\\%$$

The count went **up**, but the rate **improved** by 16.7%.

Other unit rules:

- Say **percentage points** or **percent** precisely.
- Use the **same time units** for baseline, target and benefit.
- State the **direction** (lower is better for breaches; higher is better for first-time fix).
- For time CTQs, also report the **% meeting the limit**; an average of 3.5 hours can hide many incidents over 4 hours.

The book (p. 285) adds a warning: a **statistically** significant change is not always a **practically** significant one — the improvement must have real business value.`},{heading:"Linking metrics to CTQs and setting targets",body:`Every project metric should trace back to a CTQ: **need → CTQ → primary metric → target**. "My service must come back quickly" → CTQ *restore within 4 hours* → primary metric *% of P1/P2 incidents restored after 4 hours*.

Where should the target come from? Three reference points:

- **Baseline** — where you are now.
- **Entitlement** — the **best demonstrated performance** of the current process (book glossary, p. 585). If one region already restores 95% on time, that level is clearly possible.
- **Benchmark** — what comparable organisations achieve.

The book's **breakthrough** level (≈ 70% over baseline, p. 584) reminds you that targets should be ambitious.

**Example:** MTTR baseline 6.4 h, proposed target 4.0 h.

$$\\text{Improvement} = \\dfrac{6.4 - 4.0}{6.4} \\times 100 = 37.5\\%$$

A 70% gain would need $6.4 \\times (1 - 0.70) = 1.92$ hours. **Trap:** dividing by the new value (4.0) gives 60% — always divide by the **baseline**.`}],keyPoints:["Metric (book p. 587): a key performance indicator linked to goals and closely monitored.","Baseline = performance before change, from **long-term** data with a clear operational definition.","One **primary** metric (the project Y); **secondary** metrics are guard-rails.","Success = primary improves **without compromising** the secondary metrics.","Leading indicators move first (often process); lagging confirm later (often outcome).","Normalise counts by volume before comparing.","Targets: baseline, **entitlement** (best demonstrated), benchmark; breakthrough ≈ 70%."],examTips:['"PRIMARY metric?" — the one that directly measures the charter problem, not the guard-rail or the money.',"An option that improves the primary metric by hurting a secondary metric is not success.",'"What is established FIRST?" — the baseline (with an operational definition), then the target.',"Percentage improvement always divides by the **baseline**."]},{topic:"1.3.3",title:"Financial Evaluation & Benefits Capture",...f,intro:"A project's value must be **classified** (hard savings, soft savings, cost avoidance, revenue) and **proven**. Benefits are **estimated** in Define, **validated** after Improve and **realised** only after Control, normally with an independent **Finance representative** and about 12 months of tracking.",sections:[{heading:"Kinds of project value",body:`Finance sorts benefits into four groups:

- **Hard savings** — a measurable fall in **actual spending** against a baseline, visible in the profit and loss: fewer SLA credits paid, lower contractor invoices, fewer late-payment charges.
- **Soft savings** — real but indirect: engineer hours freed, higher satisfaction, faster decisions. They become hard only if the business acts on them (cancels overtime, avoids planned hiring).
- **Cost avoidance** — preventing a **future** cost not yet paid: avoiding a fine, a planned capacity purchase, next year's penalty clause. Valuable, but today's spend does not fall.
- **Revenue growth** — extra income from kept customers, new sales or faster billing.

The book glossary (p. 585) says the **Finance representative** gives an **independent evaluation** of a project's hard and/or soft savings and supports Champions and project leaders. Independence matters: Belts are naturally optimistic about their own projects.`},{heading:"Estimated, validated, realised",body:`Benefits change status as the project moves on:

1. **Estimated** — in the charter (Define), based on the baseline COPQ and the goal. Rough on purpose.
2. **Validated** — after Improve, when pilot data shows the real effect and Finance agrees the method (baseline, attribution, category).
3. **Realised** — after Control, when the gain has lasted and the money has really appeared, tracked month by month for about **12 months**.

The book's DMAIC roadmap ends Control with **"Verify Financial Impact"**, just before "Go to Next Project" (p. 499). Its Control roadblocks include "**financial benefits are not tracked and integrated into the business**" (p. 577). The closing checklist asks whether **the Champion, the Belt and Finance all agree** the project is complete (p. 578).

Exam questions often hide this in one word: a benefit is *estimated* in Define and *realised* only after Control.`},{heading:"Percentage improvement and cost of the solution",body:`The simplest evaluation compares new performance with the baseline (for "lower is better" metrics):

$$\\text{Improvement \\%} = \\dfrac{\\text{Baseline} - \\text{New}}{\\text{Baseline}} \\times 100$$

**Example:** annual SLA credits fall from OMR 540,000 to OMR 216,000.

$$\\text{Improvement \\%} = \\dfrac{540{,}000 - 216{,}000}{540{,}000} \\times 100 = 60\\%$$

Always divide by the **baseline**, never by the new value.

Solutions also cost money. The book (pp. 557–558) says selecting a solution is a **business decision** about impact, cost and timing, and a **cost-benefit analysis** helps set priorities. Costs have two parts:

- **initial** — training the workforce, new materials, building the improvement, capital;
- **ongoing** — future training, inspection, monitoring, materials.

So report **gross** benefit (total cost reduction) and **net** benefit (after ongoing costs), and keep **time units consistent**.`},{heading:"ROI and payback (supplementary)",body:`ROI and payback are not given in the syllabus or book pages, but real business cases use them.

$$\\text{ROI \\%} = \\dfrac{\\text{Benefit} - \\text{Cost}}{\\text{Cost}} \\times 100$$

$$\\text{Payback} = \\dfrac{\\text{Investment}}{\\text{Net benefit per period}}$$

**Example (continued):** gross annual saving $540{,}000 - 216{,}000 = 324{,}000$. One-off project cost 60,000; ongoing dashboard cost 12,000 a year. First-year cost $60{,}000 + 12{,}000 = 72{,}000$.

$$\\text{ROI} = \\dfrac{324{,}000 - 72{,}000}{72{,}000} \\times 100 = 350\\%$$

Net monthly benefit:

$$\\text{Net monthly} = \\dfrac{324{,}000 - 12{,}000}{12} = 26{,}000$$

$$\\text{Payback} = \\dfrac{60{,}000}{26{,}000} \\approx 2.3 \\text{ months}$$

**Trap:** dividing 60,000 by the **annual** benefit gives 0.19 — that is **years**, not months. The payback is in the unit of the benefit rate.`},{heading:"Classifying and tracking benefits",body:`**Example — classify the saving.** Repeat truck rolls fall from 1,500 to 900 a month at OMR 35 each. 60% were done by a contractor paid per visit; 40% by in-house staff whose headcount did not change.

$$\\text{Improvement} = \\dfrac{1{,}500 - 900}{1{,}500} \\times 100 = 40\\%$$

- Contractor share (hard — invoices really fall): $600 \\times 0.6 \\times 35 = 12{,}600$ a month, or $12{,}600 \\times 12 = 151{,}200$ a year.
- In-house share (soft — capacity freed, no cost removed): $600 \\times 0.4 \\times 35 = 8{,}400$ a month, or $100{,}800$ a year.

Reporting all OMR 252,000 as hard savings would be wrong.

Good benefits capture:

- **agree the method early** with Finance (baseline period, formula, normalisation, category);
- **attribute honestly** — if volume fell because a big customer left, that is not a project benefit;
- **track monthly for about 12 months**; ramp-up months are often below the estimate;
- **hand over**: Process Owner keeps the gain, Champion signs, Finance records the realised figure.`}],keyPoints:["Hard savings reduce actual spend; soft savings free capacity; cost avoidance prevents future cost.","Finance representative (book p. 585): independent evaluation of hard and soft savings.","Benefits: **estimated** (Define) → **validated** (after Improve) → **realised** (after Control).","Last Control step on the roadmap: **Verify Financial Impact**.","Improvement % divides by the **baseline**.","Track realised benefits for about 12 months; Champion, Belt and Finance sign off.","ROI and payback are supplementary; keep time units consistent."],examTips:['"Benefits are confirmed at the Define tollgate" — false; Define holds estimates only.','"Which is a HARD saving?" — fewer penalty credits or contractor invoices; freed engineer hours are soft.','"Who validates financial benefits?" — an independent Finance representative, not the Belt alone.',"Payback questions mixing annual and monthly figures — convert to one period first."]},{topic:"1.4.1",title:"Understanding Lean",...f,intro:"**Lean** is a way of seeing work through the **customer's eyes**: keep the steps that add value, remove the waste, and make work **flow** quickly without stopping. Lean watches the **work item** (the ticket, the order), not how busy the people are.",sections:[{heading:"Lean is a way of seeing work",body:`Many people meet Lean as a toolbox — 5S, kanban, value stream maps. The tools matter, but they express a deeper idea: **deliver what the customer values, as smoothly and quickly as possible, with the fewest resources, and keep improving.**

The big change Lean asks for is a change of viewpoint. Traditional management watches the **resource**: is the engineer busy, is the machine running? Lean watches the **work item**: the ticket, the order, the invoice. A service desk where every agent is 100% busy can still give terrible service if tickets sit in queues between those busy people. A useful habit: **"follow the ticket, not the engineer."**

Lean also rests on **respect for people**. Waste is nearly always a feature of the **system** — poor hand-offs, unclear standards, batching — not of lazy individuals. The people doing the work usually see the waste first, so Lean improvement involves them.

The book glossary (p. 590) defines **waste** as material, effort and time that does not add value in the eyes of key stakeholders — **customers, employees and investors**.`},{heading:"Value is defined by the customer",body:`In Lean, **value** is what the **customer** recognises and would willingly pay for — never what the organisation thinks is valuable. The book (p. 117) gives two tests for each step:

1. Does the step **change the form, fit or function** of the product or service?
2. Is the **customer willing to pay** for it?

A step that passes both tests is **value-added (VA)**. The book glossary (p. 587) defines **non-value-added (NVA)** as any activity that does not add value in this sense. The goal of the VA/NVA test is to **remove unnecessary activity (waste)**.

The book adds a handy hint: if an activity starts with **"re-"** — rework, replace, review, re-enter, re-route — there is a good chance it is waste.

Example: a customer's data service fails. Diagnosing and fixing the network setting changes the **function** of the service — value. Passing the ticket between three resolver groups changes nothing the customer feels — nobody pays for a ticket that was "reassigned beautifully".`},{heading:"VA, NVA and business-value-added",body:`Every step falls into one of three groups:

| Type | Meaning | Action | Example |
|---|---|---|---|
| **Value-added (VA)** | Passes both tests | Keep and improve | Restoring the customer's line |
| **Non-value-added (NVA)** | Fails the tests; not required | **Eliminate** | Waiting in a queue, mis-routing, searching, correcting errors |
| **Business-value-added (BVA)** | Customer would not pay, but the business **must** do it (legal, regulatory, safety, contract) | **Minimise and simplify**, do not delete | Outage report to the regulator, ID check before a SIM swap |

The book (p. 117) agrees that **some non-value activities cannot be removed**, such as data collection for regulations. Map NVA steps with a red X or a label.

Be **sceptical of the BVA label**. Teams often defend habits as "required" when no law or contract demands them. Ask: *who requires this, and where is it written?*

Inspection and approval steps do **not** change form, fit or function, so they are never VA. At best they are BVA.`},{heading:"The five Lean principles (supplementary)",body:`Womack and Jones summarised Lean thinking in five principles. They are widely taught but are **supplementary** — they are not in the supplied book pages.

| # | Principle | Question | Incident example |
|---|---|---|---|
| 1 | **Value** | What does the customer value? | Fast, first-time restoration |
| 2 | **Value stream** | Which steps deliver it, end to end? | Every step from call to confirmed restoration |
| 3 | **Flow** | How do the VA steps move without stopping? | Route correctly first time; remove queues |
| 4 | **Pull** | Do we work only on real demand? | Spares released by actual faults, not forecasts |
| 5 | **Perfection** | How do we keep improving? | Daily review of breaches; refine standard work |

The **order** matters: you cannot design flow until you know the value stream, and you cannot map the value stream until you have defined value from the customer's view.

The book's own Lean tools pyramid (p. 502) runs from the base up: **5S → Visual Factory → Standardized Work → Kaizen → Kanban**, with sustaining results as the continuous goal. Each level needs the one below it.`},{heading:"Flow, efficiency and a worked example",body:`**Effectiveness** = doing the **right things** (the outcome the customer needs). **Efficiency** = doing things **right** (least time, cost, effort). A desk that closes tickets fast without fixing the fault is efficient but not effective. Lean wants both, and starts with effectiveness.

Lean also separates **resource efficiency** (keeping people busy) from **flow efficiency** (how much of the item's time has value added). A simple, supplementary measure:

$$\\text{Process efficiency} = \\dfrac{\\text{value-added time}}{\\text{total lead time}}$$

**Lead time** is the total time a unit spends in the process, from entry to exit, including waiting — not the same as cycle time.

**Example:** a fibre order takes 10 days (240 hours) from request to activation. Only 6 hours of work actually change the service.

$$\\text{Process efficiency} = \\dfrac{6}{240} = 0.025 = 2.5\\%$$

97.5% of the time is waiting and hand-offs. The biggest gains come from attacking **waiting**, not from making the 6 hours of work faster.

**Trap:** dividing VA time by NVA time only. The denominator is the **total** lead time.`}],keyPoints:["Lean: deliver customer value with the least waste and smooth, fast flow.","Value is defined by the **customer**.","VA test (book p. 117): changes form, fit or function **and** the customer will pay.","NVA → eliminate; business-value-added (required) → minimise, do not delete.",'"Re-" activities (rework, review, re-enter) are usually waste.',"Book Lean pyramid: 5S → Visual Factory → Standardized Work → Kaizen → Kanban.","Process efficiency = VA time divided by **total** lead time."],examTips:['"Who defines value?" — the customer, never management or the process owner.',"Inspection, checking and approval are **not** value-added.",'Required regulatory steps are minimised, not "eliminated".',"Do not confuse lead time (total elapsed, including waiting) with cycle time (time per unit at a step)."]},{topic:"1.4.2",title:"The History of Lean",...f,intro:`Lean grew from **Ford's** moving assembly line (flow), through the **Toyota Production System** built by Taiichi Ohno (Just-in-Time and Jidoka), to the Western name **"lean"** (Krafcik, 1988) and the books that spread it. The supplied course book has no Lean history pages; this lesson follows the academy lesson. The book only notes that 5S, muda, kanban and poka-yoke are **Japanese** terms.`,sections:[{heading:"Before Lean: Ford and the power of flow",body:`Before the 20th century, cars were made by **craft production**: skilled workers fitted hand-made parts, one car at a time. Quality varied and costs were high.

In **1913**, at Highland Park, **Henry Ford** introduced the **moving assembly line** for the Model T. The car moved past the workers; each did a short, standard task with **interchangeable parts**. Assembly time fell sharply and the car became affordable.

Ford proved that **continuous flow** is very powerful. But his system had a weakness: it needed **very high volumes of one standard product**, long runs and large stocks of parts. It struggled with **variety and change**.

Remember this tension. Toyota's challenge was to keep the power of flow while making **many different products in small volumes, without waste**.`},{heading:"The Toyota family and post-war Japan",body:`Two ideas came from the Toyoda family before Lean had a name:

- **Sakichi Toyoda** invented automatic looms, including one that **stopped itself when a thread broke**, so a defect was not repeated and one worker could watch many machines. This is the origin of **jidoka** — "automation with a human touch".
- **Kiichiro Toyoda**, who founded the car company in 1937, promoted making parts **just in time** for use instead of storing big stocks.

After the Second World War, Japan's situation was very different from Detroit's: little capital, a small home market needing **many models in low volumes**, and no money for warehouses full of parts. In **1950 Eiji Toyoda** visited Ford's US plants. He and production manager **Taiichi Ohno** decided that copying mass production would not work. Toyota needed flow **with** variety and **without** waste.`},{heading:"The Toyota Production System: JIT and Jidoka",body:`Over the next decades **Taiichi Ohno** and colleagues built the **Toyota Production System (TPS)**, often drawn as a house with two pillars:

1. **Just-in-Time (JIT)** — make only what is needed, when it is needed, in the amount needed. Ohno was inspired by American **supermarkets**, which refill shelves only as customers take goods. This became **pull** production, signalled by **kanban** cards. (Book p. 511: kanban is the Japanese word for a communication **signal or card**, usually a signal to begin work.)
2. **Jidoka** — build quality in at each step. When something abnormal appears, the line **stops** so the problem is fixed at its source, not passed on.

To make small batches pay, changeovers had to be fast. **Shigeo Shingo** developed **SMED** (Single-Minute Exchange of Die), cutting die changes from hours to under ten minutes. Shingo is also linked to **poka-yoke**, Japanese for **mistake-proofing** (book glossary p. 587).

Under both pillars sit **standardised work** and **kaizen**. Ohno also classified the shop-floor wastes — the origin of the **seven wastes** (topic 1.4.4).`},{heading:'From TPS to "Lean": the name and the books',body:`For years TPS was little known outside Japan. Interest grew after the **1973 oil crisis**, when Toyota recovered faster than others. Ohno published his account, *Toyota Production System*, in Japanese in **1978** (English edition 1988).

In the 1980s MIT's **International Motor Vehicle Program** compared car plants worldwide. In **1988** researcher **John Krafcik** used the word **"lean"**, because the Toyota system used **less of everything** — effort, space, inventory and time.

Two books then spread the idea:

| Year | Book | Contribution |
|---|---|---|
| 1990 | *The Machine That Changed the World* — Womack, Jones, Roos | Popularised "lean production" |
| 1996 | *Lean Thinking* — Womack, Jones | The **five principles**: value, value stream, flow, pull, perfection |

Order to remember: **Krafcik coined (1988) → *Machine* popularised (1990) → *Lean Thinking* generalised (1996).**`},{heading:"Lean beyond the factory",body:`Once Lean was stated as **principles** instead of car-plant tricks, it spread quickly:

- **Healthcare** — less waiting for test results, less duplicated paperwork, fewer unnecessary patient movements.
- **Services and offices** — banks, insurers and governments applied it to loans, claims and invoices, where the "inventory" is a pile of unprocessed cases.
- **IT and telecom** — Lean IT, Lean software development and the wider **DevOps** movement focus on fast, reliable flow. Kanban boards are now common in service desks and network operations centres.

At the same time, companies using Six Sigma (from Motorola) began combining it with Lean: **Lean for speed and flow, Six Sigma for variation and defects** — Lean Six Sigma (topic 1.4.3).

One book-based fact: a book quiz distractor, "Lean is Six Sigma that originated in South-East Asia", is **wrong**. Lean came from Toyota in Japan; Six Sigma came from Motorola in the USA.`}],keyPoints:["Ford (1913): moving assembly line — the power of **flow**, but weak on variety.","Sakichi Toyoda's self-stopping loom → **jidoka**. Kiichiro Toyoda → **just in time**.","Taiichi Ohno built the **Toyota Production System**; two pillars: **JIT** and **Jidoka**.","Shigeo Shingo: **SMED** (quick changeover) and **poka-yoke** (mistake-proofing).","Kanban = Japanese for signal or card; it controls **pull**.",'"Lean" coined by **John Krafcik, 1988**; popularised by *The Machine That Changed the World* (1990).',"*Lean Thinking* (1996) gave the five principles."],examTips:["Ford gave the moving assembly line, **not** TPS or jidoka.","Do not swap the pillars: JIT = right amount at the right time; Jidoka = stop and fix, build quality in.","SMED belongs to **Shingo** and cuts set-up time; it is not a defect-counting tool.",'"Who first used the term lean?" — Krafcik (1988), not Womack and Jones (1996).']},{topic:"1.4.3",title:"Lean & Six Sigma",...f,intro:"**Lean** attacks **waste and delay** to make work faster and smoother. **Six Sigma** attacks **variation and defects** to make results consistent. They solve two halves of the same problem, so **Lean Six Sigma** uses both — usually DMAIC as the backbone with Lean tools inside it.",sections:[{heading:"Lean: speed, flow and waste",body:`Lean judges a process by how smoothly and quickly **value flows** to the customer. Its enemy is **waste (muda)** — the seven wastes such as waiting, correction and overprocessing. Its questions:

- What does the customer value, and which steps are value-added?
- Where does the work item wait, travel or get reworked?
- How can we create flow and pull?

Lean results often come **quickly**: a removed approval, a reorganised queue, a kanban board with WIP limits. Many Lean improvements need **little statistics**, because the waste is obvious once the process is seen clearly — a ticket that waits 90 minutes for nobody needs no hypothesis test.

Typical Lean measures: **lead time, work in progress, process efficiency, throughput**.

The book (p. 501) adds that Lean tools can be used **at any time** in a project, not only in Control — to reduce variation, deal with outliers, or **clean up a process before, during or after** a project.`},{heading:"Six Sigma: variation, defects and capability",body:`Six Sigma judges a process by how **consistently** it meets customer requirements. Its enemy is **variation**, because variation produces **defects** — results outside the CTQ specification limits. Its questions:

- What is the output **Y**, and which inputs **X** drive it? ($Y = f(X)$)
- How **capable** is the process of meeting the specification?
- What is the **verified root cause** of the defects?

Six Sigma is **data-driven and structured**. It follows **DMAIC** and uses statistics to separate real causes from opinions. Typical measures: **DPMO, yield, standard deviation, sigma level, Cp/Cpk**.

Projects usually take longer than a Lean quick win, because a hidden cause of variation needs evidence.

A simple test to tell the problems apart: **waste makes the average too long or too costly; variation makes the result unpredictable.**`},{heading:"Waste or variation? Examples",body:`| Situation | Problem type | Best first lens |
|---|---|---|
| Every fault ticket waits about an hour for change approval | Waste (waiting) — consistent and visible | Lean |
| Restore times for the same fault range from 30 min to 9 h by shift and engineer | Variation — cause hidden | Six Sigma |
| Parts moved between distant buildings | Waste (conveyance) | Lean |
| A drilled hole whose diameter drifts outside tolerance | Variation | Six Sigma |
| Patients wait for a bed after discharge is approved | Waste (waiting) | Lean |

The two are linked. The book (p. 502) says reducing muda **can reduce outliers and help prevent defects**, because outliers arise from **differing waste** among procedures, machines and people. An extra manual re-entry step is waste — and also a new chance for a typing error that creates variation.

The book's quiz (Control Q6) puts it simply: **muda means waste, which shows that defects are occurring in the process.**`},{heading:"Why they need each other — what the book says",body:`Speed without reliability is not good service: a desk that closes tickets fast but reopens a third of them only moves waste around. Reliability without speed fails too: a perfectly consistent five-day repair is still five days.

The supplied book links the two in several ways:

- **Waste is often the root of a Six Sigma project** (p. 502). All Belt projects focus on one or more of the seven waste areas, and the charter's primary metric often measures waste.
- **Lean tools add the discipline needed to sustain gains** from Six Sigma projects (p. 502).
- **"A Six Sigma project is actually a Kaizen"** (p. 510). The book calls kaizens Six Sigma projects with business impact, and **kaikaku** — breakthrough successes — the **first focus** of Six Sigma projects.
- If you see **outliers, declining benefits or falling capability**, the five Lean concepts help sustain the project (p. 513).

**Kaizen** (book p. 510): the philosophy of continual improvement — every process can and should be evaluated and improved for time, resources, quality and more.

Message for the exam: Lean and Six Sigma are **partners, not rivals**.`},{heading:"Choosing the approach",body:`Not every problem needs a four-month DMAIC project.

| Situation | Best fit |
|---|---|
| Cause and fix both obvious, low risk, cheap | **Just do it** — implement and confirm |
| Visible waste (queues, hand-offs, rework loops, clutter) | **Lean tools / kaizen event** — days, not months |
| Cause unknown; problem is inconsistency or defects; data available | **DMAIC (Six Sigma)** |
| Slow **and** inconsistent, high business impact | **Lean Six Sigma** |

In Lean Six Sigma, DMAIC stays the backbone and Lean tools are used wherever they help:

- **Define:** customer value, VOC, a charter whose primary metric captures the waste or defects.
- **Measure:** baseline lead time and defect rates; value stream maps (a Measure item, 2.1.2).
- **Analyze:** separate waste causes from variation causes; verify with data.
- **Improve:** flow, pull, quick changeover and mistake-proofing alongside tested solutions.
- **Control:** 5S, visual management, standard work and control charts.

Lean shortens the **average**; Six Sigma narrows the **spread**. Together they move the whole distribution inside the SLA.`}],keyPoints:["Lean = waste, speed, flow. Six Sigma = variation, defects, capability.","Waste makes results slow/costly; variation makes them unpredictable.","Book p. 502: waste is often the root of a Six Sigma project; Lean tools help sustain gains.","Book p. 510: a Six Sigma project is a kaizen; kaikaku (breakthrough) is the first focus.","Lean tools can be used at any time in a project (book p. 501).","Lean Six Sigma = DMAIC backbone + Lean tools inside.","Known cause and cheap fix → just do it, not DMAIC."],examTips:['"Which approach PRIMARILY reduces variation?" — Six Sigma, not Lean.',"An option saying Lean and Six Sigma must be used on separate processes is wrong — they work together.","A scenario with an obvious cause and cheap fix: the BEST action is to implement it, not launch DMAIC.",'True/false "a Six Sigma project is a kaizen" — **true** in the course book.']},{topic:"1.4.4",title:"The Seven Elements of Waste",...f,intro:"**Waste (muda)** is any activity that uses resources but adds no value for the customer. The syllabus lists **seven elements of waste**: **Overproduction, Correction, Inventory, Motion, Overprocessing, Conveyance and Waiting**. You must name them, recognise each in a scenario and tell the confusing pairs apart.",sections:[{heading:"The seven elements and where they come from",body:`The book (p. 502) lists "the 7 basic elements of waste (**muda** in Japanese)": Correction, Overproduction, Processing, Conveyance, Inventory, Motion and Waiting. The syllabus uses the same list but calls "Processing" **Overprocessing**.

The book makes three points:

- **Identifying waste is the first step to removing it.** You already did this with your charter and primary metric, even if you did not use the word "waste".
- **Waste is often the root of a Six Sigma project.**
- These wastes **can come back** if Lean tools are not used to hold the gains.

A memory aid for the syllabus order: **O-C-I-M-O-C-W** — Overproduction, Correction, Inventory, Motion, Overprocessing, Conveyance, Waiting.

A tip from process mapping (book p. 117): steps that begin with **"re-"** (re-enter, re-check, re-test, re-dispatch) are usually waste in disguise.`},{heading:"Overproduction, Correction, Inventory",body:`**Overproduction** — making **more, or earlier**, than the next step needs.
*Signs:* piles of finished work nobody asked for; reports printed but never read. *Service example:* mailing paper statements to customers who already get e-bills. *Fix:* produce to real demand — pull, smaller batches, just-in-time.
Overproduction is often called **the worst waste** because it **creates the others**: the extra output must be stored (Inventory), moved (Conveyance) and it hides defects (Correction).

**Correction** — effort spent **fixing errors**: defects plus the rework, inspection and repeat work they cause.
*Signs:* repeat visits, reopened tickets, credit notes, "please resubmit". *Example:* an invoice with a wrong PO number is rejected and processed again. *Fix:* mistake-proofing, clear operational definitions, fix root causes instead of adding checkers. Much Correction lives in the **hidden factory**.

**Inventory** — more material, information or **work-in-progress** than needed right now.
*Signs:* backlogs, full shelves, hundreds of tickets "awaiting assignment". *Fix:* limit WIP, balance capacity, replenish on use. Inventory ties up cash and **hides problems**, like water covering rocks.`},{heading:"Motion, Overprocessing, Conveyance, Waiting",body:`**Motion** — unnecessary movement of **people** (or equipment) **within the workplace**: reaching, bending, searching, walking back to the van, clicking through seven screens. *Fix:* better layout, point-of-use storage, one dashboard — **5S** is the classic tool.

**Overprocessing** — doing **more work, or to a higher standard, than the customer needs**: extra approvals, duplicate data entry, a 20-page report where one line would do, a tolerance far tighter than the drawing. *Example:* a manager signs every standard order that the system already validated. *Fix:* confirm requirements with the VOC; remove steps that change nothing the customer values. (Book name: "Processing".)

**Conveyance** — moving **materials, products or information between locations** more than necessary: many hand-offs, double handling. *Example:* a ticket bounced through three resolver groups; a router shipped warehouse → hub → depot → van. *Fix:* route directly, co-locate, fewer hand-offs.

**Waiting** — people, equipment or work **idle** because something upstream is not ready: "pending approval", a technician on site waiting for remote activation, a release waiting for the weekly change board. *Fix:* balance workload, synchronise hand-offs, pre-approve standard changes. Waiting is measured in **time** and directly stretches lead time.`},{heading:"The pairs that trip people up",body:`**Motion vs Conveyance.** Ask *what* moves and *where*. A **person** moving within the work area = **Motion**. **Materials or information** travelling between locations = **Conveyance**. A technician walking to the van and back = Motion. A pallet of modems trucked to a depot = Conveyance.

**Overproduction vs Overprocessing.** Overproduction is about **quantity and timing** (too many, too soon). Overprocessing is about **effort per item** (too much work on each). Printing 1,000 brochures when 400 are needed = Overproduction. Laminating each one when nobody asked = Overprocessing.

**Correction vs Inventory.** Correction is **effort spent fixing** an error. Inventory is **a quantity sitting** in the system. A stack of rejected invoices: the stack is Inventory; the re-keying is Correction.

**Waiting vs Inventory.** Two views of the same queue. From the **work item's** view, 500 queued orders = **Inventory**. From the **person's or customer's** view, being idle = **Waiting**. The question's wording tells you which view it means: "the agent is idle until…" → Waiting; "500 orders are queued" → Inventory.`},{heading:"Seven elements versus the eight wastes (DOWNTIME)",body:`You will also meet the **eight wastes**, remembered as **DOWNTIME**: Defects, Overproduction, Waiting, **Non-utilized talent**, Transportation, Inventory, Motion, Extra-processing. The syllabus **introduction** (p. 2) uses this list, but **topic 1.4.4** names the **seven** elements. Know how they line up:

| Syllabus 1.4.4 | Book p. 502 | Eight-waste list |
|---|---|---|
| Correction | Correction | Defects |
| Overproduction | Overproduction | Overproduction |
| Waiting | Waiting | Waiting |
| — | — | **Non-utilized talent** |
| Conveyance | Conveyance | Transportation |
| Inventory | Inventory | Inventory |
| Motion | Motion | Motion |
| Overprocessing | Processing | Extra-processing |

Three renames and **one addition**. Non-utilized talent (not using people's skills and ideas) is a real waste, but it is **not one of the seven elements**. When a question asks for "the seven elements of waste", answer with the seven syllabus terms.

The book (p. 511) adds that **kanban** is the best inventory-control method for attacking several of the seven wastes.`}],keyPoints:["Seven elements (syllabus): Overproduction, Correction, Inventory, Motion, Overprocessing, Conveyance, Waiting.",'Muda = Japanese for waste; the book calls Overprocessing simply "Processing".',"Overproduction is often called the worst waste — it creates the others.","Motion = people moving within the workplace; Conveyance = things/information moving between locations.","Overproduction = too many/too soon; Overprocessing = too much work per item.","Non-utilized talent is in the eight-waste (DOWNTIME) list, **not** in the seven.","Identifying waste is the first step to eliminating it."],examTips:['Options using "Defects", "Transportation" or "Extra-processing" are eight-waste names; the seven use Correction, Conveyance, Overprocessing.','"Which is NOT one of the seven elements?" — Non-utilized talent.',"A technician walking repeatedly to the van = Motion, not Conveyance.","Extra approvals on an already-validated order = Overprocessing, not Overproduction.",'"Which waste causes the others?" — Overproduction.']},{topic:"1.4.5",title:"5S: Sort, Straighten, Shine, Standardize, Self-Discipline",...f,intro:"**5S** is a five-step method to organise a workplace so that it is clean, everything has a place, and **problems become visible**. The book sums it up: the workplace is clean, there is a place for everything, and everything is in its place. 5S is the **base** of the Lean tools pyramid and the **starting point** for improving a process.",sections:[{heading:"Why 5S comes first",body:`The book (p. 503) says 5S was **developed in Japan** and comes from Japanese words for five practices that lead to a clean, manageable work area. It is **the starting point for implementing improvements** to a process.

The book's Lean pyramid (p. 502) puts **5S at the base**, then Visual Factory, Standardized Work, Kaizen and Kanban. You cannot run a visual factory in a cluttered space.

| Step | Syllabus term | Japanese | Book's English (p. 504) |
|---|---|---|---|
| 1 | **Sort** | Seiri | Sorting |
| 2 | **Straighten** | Seiton | Straightening |
| 3 | **Shine** | Seiso | Shining |
| 4 | **Standardize** | Seiketsu | Standardizing |
| 5 | **Self-Discipline** | Shitsuke | **Sustaining** |

The book uses "Sustaining" for step 5; the syllabus says **Self-Discipline**. Same step. The book also advises: focus on the **English words**, they are easier to remember.

Two more book points (p. 503): the **first three S's are workplace actions**; the **last two are sustaining actions**. And start in a **pilot area**, then spread step by step.`},{heading:"1. Sort — keep only what is needed",body:`**Sort** removes everything not needed for the current work, keeping only the essentials (book p. 504). The book's method (p. 505) classifies every item as **useful, useless or unknown**:

- **Useless** — dispose of it now.
- **Unknown** — keep and monitor: leave it (often red-tagged) for a set period; if nobody uses it, dispose of it.
- **Useful** — keep it, stored by how often it is used.

Start with the **easiest items**. Discuss removal with everyone involved.

**ABC storage by frequency of use** (book p. 506):

| Class | How often used | Where it lives |
|---|---|---|
| A | Daily or several times a day | Within arm's reach |
| B | Weekly | Locally, nearby cabinet or shelf |
| C | Monthly or quarterly | Remote storage, a few minutes' walk |

The workplace should only hold items needed **daily to weekly**.

*Example (NOC bench):* console, headset and runbook = A. A spare module used weekly = B. Old cables and dead laptops = useless. A box of unlabelled patch cords = unknown.

Why sort? Less waste, a **safer** area, more space and an easier-to-see process.`},{heading:"2. Straighten and 3. Shine",body:`**Straighten** (also called *Set in order*) gives every remaining item a **designated, labelled place**, easy to see and reach (book p. 506). Techniques: labels, floor tape, signs, **shadow outlines** of tools, things used together kept together, shared items in a central place.

The payoff is visual: an **empty outline** on a shadow board shows instantly that a tool is missing. Straighten cuts **search time and walking**, so it attacks Motion and Waiting. The book says orderliness removes waste in both production and office work.

**Shine** (also called *Sweep*) means cleaning the area and equipment and **finding ways to keep it clean** (book pp. 504, 507). Its key idea is **mess prevention**: find out why the mess appears and stop it at the source. A layout map that gives each area a named cleaner removes any **"no man's land"**.

Shine is really **cleaning as inspection**. Wiping a rack, you notice the loose connector. Clearing hundreds of stale alarms lets the genuinely new alarm stand out. A clean workplace **reveals abnormal conditions**.`},{heading:"4. Standardize versus 5. Self-Discipline",body:`These two are often confused.

**Standardize** creates the **rules** that keep the first three S's in place (book p. 504). The book (p. 507) says **orderliness is the core of standardization**, kept by **visual controls**: signboards, painted lines, colour coding, photo standards, a daily checklist, a folder-naming rule. Its aim: keep the workplace at a level that **uncovers problems and makes them obvious**. Question it answers: *what does good look like, and how do we all do it the same way?*

**Self-Discipline (Sustaining)** is the **habit and commitment** to follow the standards every day without being chased. The book (p. 508) calls it the discipline and commitment behind all the other stages — **practise and repeat until it becomes a way of life** — supported by **schedules and checklists**. Regular **5S audits**, leadership attention and recognition keep it alive. Question it answers: *do we keep doing it, and how do we know?*

**Quick test:** a written rule or a visual marker = **Standardize**. The routine of honouring it, checked by audit = **Self-Discipline**.`},{heading:"Benefits, warning signs and digital 5S",body:`**Benefits** (book p. 508): a cleaner and **safer** workplace, better quality (fewer contaminants), higher efficiency and job satisfaction. The book adds that 5S's strength depends on employees and the company **staying committed** to it (p. 503).

**Signs that you need 5S** (book p. 513): **outliers** in your project metric and **loss of the initial gains** from the project. Without 5S, standardized work instructions will not create consistency.

The **visual factory** is built on 5S standards (book p. 508): a place where even a newly hired supervisor can see inventory levels, extra tools, scrap, downtime and set-up problems at a glance.

**Digital 5S** applies the same steps where there is no physical bench:

- **Shared drives** — Sort obsolete files; Straighten with a clear folder structure; Shine by archiving; Standardize a template; Sustain with a quarterly review.
- **Ticket queues** — close stale tickets, set clear categories, colour ageing tickets.
- **Dashboards** — keep only KPIs someone acts on, in a fixed layout.

Some organisations add **Safety** as a sixth S (6S). It is not in the syllabus list.`}],keyPoints:["5S order: **Sort → Straighten → Shine → Standardize → Self-Discipline** (book: Sustaining).","Japanese: Seiri, Seiton, Seiso, Seiketsu, Shitsuke.","5S is the base of the book's Lean pyramid and the starting point for improvement.","First three S's = workplace actions; last two = sustaining actions.","Sort: useful / useless / unknown; ABC storage by frequency of use.","Standardize = rules and visual controls; Self-Discipline = habit, checked by audits.","Signs 5S is needed: outliers in the project metric, loss of initial gains."],examTips:['"Which S comes FIRST?" — Sort (Seiri).',"Shadow boards and labelled locations = **Straighten**, not Sort.","Photo standards and colour-coded zones = **Standardize**; regular audits and habit = **Self-Discipline**.",'"Which S is mainly inspection through cleaning?" — Shine.',"Expect alternative labels (Set in order, Sweep, Sustain) — map them to the syllabus terms."]}],We=Object.freeze(Object.defineProperty({__proto__:null,lessons:Le},Symbol.toStringTag,{value:"Module"})),Be=[{topic:"4.1.1",title:"Correlation",pages:"Book pp. 428–432",doc:"book-401-500",pdfPage:31,intro:"Correlation measures **how strongly two continuous variables move together in a straight line**. It gives one number, the correlation coefficient **r**, between −1 and +1. In Improve it is the first check before regression: if X and Y are not related, there is no point building a Y = f(X) model.",sections:[{heading:"What correlation is",body:`The book says the main purpose of linear correlation analysis is to **measure the strength of the linear association between X and Y**.

- If X increases and Y shows **no definite change**, there is **no correlation**.
- If Y tends to **rise** when X rises, the correlation is **positive**.
- If Y tends to **fall** when X rises, the correlation is **negative**.
- If the (X, Y) points follow a **straight-line path**, the correlation is **linear**. How tightly the points follow that line is the **strength**.

To do a correlation you need **bivariate data**: ordered pairs (X, Y), where both values vary. **X is the independent variable** (the input) and **Y is the dependent variable** (the output). Correlation uses **historical** process data. It is not an experiment.`},{heading:"The correlation coefficient r",body:`The sample coefficient **r** estimates the population coefficient (written R or ρ). It is calculated as:

$$r = \\dfrac{\\sum (X_i - \\bar{X})(Y_i - \\bar{Y})}{\\sqrt{\\sum (X_i - \\bar{X})^2 \\, \\sum (Y_i - \\bar{Y})^2}}$$

r always lies between **−1 and +1**:

| r | Meaning |
|---|---|
| +1 | perfect positive straight line |
| 0 | no linear relationship |
| −1 | perfect negative straight line |

The **sign** gives the direction. The **size** (absolute value) gives the strength. The book shows six scatter plots: strong, moderate and weak, each positive and negative. A cloud with a clear upward slope and little scatter is "strong positive"; a wide, loose cloud is "weak".

Note: r says nothing about the **slope**. A steep line and a shallow line can both have r = 0.95. The slope comes from regression (4.1.2).`},{heading:"Worked example: calculating r",body:`Five pairs: X = 1, 2, 3, 4, 5 and Y = 2, 4, 5, 4, 5.

**Step 1 – means.** $\\bar{X} = 3$, $\\bar{Y} = 4$.

**Step 2 – deviations.** X − X̄ = −2, −1, 0, 1, 2. Y − Ȳ = −2, 0, 1, 0, 1.

**Step 3 – sums.** Cross-products: 4 + 0 + 0 + 0 + 2 = **6**. Squares of X deviations: 4 + 1 + 0 + 1 + 4 = **10**. Squares of Y deviations: 4 + 0 + 1 + 0 + 1 = **6**.

**Step 4 – r.**

$$r = \\dfrac{6}{\\sqrt{10 \\times 6}} = \\dfrac{6}{7.746} = 0.775$$

This is a positive, moderate-to-strong correlation. Squaring it gives $r^2 = 0.60$: in simple linear regression, X would explain about 60% of the variation in Y.`},{heading:"Is it significant? Two tests",body:`The book uses a hypothesis test for correlation:

- **H₀: no correlation** (ρ = 0)
- **Hₐ: there is correlation** (ρ ≠ 0)

**Statistical significance:** compare the p-value with α (usually 0.05). If p < 0.05, **reject H₀** – the correlation is real. If p ≥ 0.05, **fail to reject H₀** (exam wording – never "accept H₀").

**Practical significance** (book guideline):

| \\|r\\| | Practical meaning |
|---|---|
| > 0.80 | practically significant |
| 0.20 – 0.80 | grey zone, use judgement |
| < 0.20 | not practically significant |

You need **both**. With a very large sample, r = 0.15 can have p < 0.05 and still be useless in practice. The book also warns that the size of r is "somewhat relative" and should be used with caution.`},{heading:"Book example: Walter Payton",body:`The book uses 13 seasons of an American football player: **X = carries**, **Y = yards** (file RB Stats Correlation.mtw).

1. **Scatter plot first** (Graph > Scatterplot > Simple). The book adds a **Lowess smoother** – a locally weighted line that shows the shape of the relationship without forcing a model. The cloud rises clearly.
2. **Correlation** (Stat > Basic Statistics > Correlation). Minitab gives **Pearson r = 0.935, P-Value = 0.000**.
3. **Decision:** p < 0.05, so reject H₀. |r| > 0.80, so the relationship is also practically significant. It is a **strong positive** correlation.

Book quirk: one sentence says "the P-value is low at .935". That is a typo – 0.935 is r, and the p-value is 0.000. Do not mix them up.`},{heading:"Limits: correlation is not causation",body:`The book stresses three limits:

1. **Correlation does not prove causation.** A strong r between X and Y does not show that X causes Y. A hidden third variable may drive both. Only a **designed experiment (DOE)** can prove cause and effect.
2. **Correlation gives strength, not an equation.** It does not tell you how much Y changes per unit of X. Regression does that ("Y equals a function of X").
3. **Only linear relationships.** A perfect U-shaped curve can give r close to 0. Always look at the scatter plot before trusting r.

The book’s rule: "To properly understand Regression you must first understand Correlation." So the order is: scatter plot → correlation → regression.`}],keyPoints:["Correlation measures the strength and direction of a LINEAR relationship between two continuous variables.","r always lies between −1 and +1; sign = direction, size = strength; 0 = no linear relationship.","H₀: no correlation; Hₐ: correlation exists. p < 0.05 → reject H₀.","Practical significance: |r| > 0.80 significant; |r| < 0.20 not significant.","Correlation does NOT prove causation – only a designed experiment can.","Correlation gives strength, not the equation; regression gives Y = f(X).","In simple linear regression, R² = r²."],examTips:["A question may give r and a p-value: judge statistical significance from p, and practical significance from |r|.","Trap: r = −0.92 is a STRONG relationship (negative direction), not a weak one.",'Trap: "strong correlation proves X causes Y" is always false.',"If asked for R² from r in simple regression, square r (r = 0.9 → R² = 0.81). Going back, r = ±√R² – take the sign from the slope.",'Use the wording "fail to reject H₀" when p ≥ α; never "accept H₀".']},{topic:"4.1.2",title:"Regression Equations",pages:"Book pp. 432–438, 442–443",doc:"book-401-500",pdfPage:35,intro:"A regression equation is a **prediction model**: it gives the value of Y for any chosen value of X. Correlation only says the relationship is strong; regression says **how much** Y changes when X changes. It is the last step in analysing continuous X–Y data.",sections:[{heading:"From correlation to an equation",body:`The book: "Correlation ONLY tells us the strength of a relationship, while Regression gives the mathematical relationship or the prediction model." Minitab finds the **best-fit** line through the data (least squares: the line that makes the sum of squared residuals as small as possible).

Prediction equations in the book:

| Model | Form |
|---|---|
| Linear (1st order) | Y = a + bX |
| Quadratic (2nd order) | Y = a + bX + cX² |
| Cubic (3rd order) | Y = a + bX + cX² + dX³ |
| Exponential | Y = a·bˣ |

**Simple regression** = one X, one Y. **Multiple regression** = two or more X’s, one Y. In Minitab, simple regression uses Stat > Regression > **Fitted Line Plot** (graph + equation) or Stat > Regression > **Regression** (full output).`},{heading:"Parts of the equation",body:`Write the simple linear model as $Y = b_0 + b_1 X$.

- **b₀ (constant / intercept):** the predicted Y when X = 0.
- **b₁ (coefficient / slope):** how much Y changes when X goes up by **one unit**.
- **X:** the predictor (also called the regressor or input).

The least-squares formulas are:

$$b_1 = \\dfrac{\\sum (X_i - \\bar{X})(Y_i - \\bar{Y})}{\\sum (X_i - \\bar{X})^2} \\qquad b_0 = \\bar{Y} - b_1 \\bar{X}$$

**Small example.** X = 1…5, Y = 2, 4, 5, 4, 5 (the same data as in 4.1.1). Cross-product sum = 6, X-squares sum = 10.

$$b_1 = \\dfrac{6}{10} = 0.6 \\qquad b_0 = 4 - 0.6 \\times 3 = 2.2$$

So Ŷ = 2.2 + 0.6X. Each extra unit of X adds 0.6 to the predicted Y. The sign of b₁ always matches the sign of r.`},{heading:"Book example: predicting Payton’s yards",body:`Minitab output: **Payton yards = −163.497 + 4.91622 × Payton carries.**

Each extra carry adds about 4.9 yards. To predict yards for **250 carries**, put X = 250 into the equation:

$$\\hat{Y} = -163.497 + 4.91622 \\times 250 = -163.497 + 1229.06 = 1065.6 \\text{ yards}$$

You can also read it roughly off the fitted line plot (about 1,067 yards).

**Exercise (Dorsett data):** the fitted line is Dorsett yards = −160.1 + 4.993 × carries, with R² = 95.0%. For 325 carries:

$$\\hat{Y} = -160.1 + 4.993 \\times 325 = -160.1 + 1622.7 = 1462.6 \\text{ yards}$$

Only predict **inside the range of X** in the data. Going outside it (extrapolation) is risky, because the line may not hold there.`},{heading:"Reading the output: R², adjusted R² and S",body:`Payton ANOVA table: SS Regression = 1,798,587; SS Error = 260,826 (MS 23,711); SS Total = 2,059,413; n = 13.

**R² (R-Sq)** = share of the total variation in Y explained by the model:

$$R^2 = \\dfrac{SS_{Regression}}{SS_{Total}} = \\dfrac{1{,}798{,}587}{2{,}059{,}413} = 0.873 = 87.3\\%$$

So 87.3% of the variation in yards is explained by carries; **12.7% is not explained**.

**Adjusted R²** corrects R² for the number of terms. With n − 1 = 12 total DF:

$$R^2_{adj} = 1 - \\dfrac{MS_{Error}}{\\left( \\dfrac{SS_{Total}}{n-1} \\right)} = 1 - \\dfrac{23{,}711}{171{,}618} = 0.862 = 86.2\\%$$

**S** = 153.985 is the standard deviation of the residuals, $S = \\sqrt{MS_{Error}}$. Smaller S = tighter fit. The book notes R² vs adjusted R² is "not terribly important" in simple regression; it matters much more in multiple regression.`},{heading:"Is the model significant? Coefficients and p-values",body:`Stat > Regression > Regression gives a coefficient table:

| Predictor | Coef | SE Coef | T | P |
|---|---|---|---|---|
| Constant | −163.5 | 172.0 | −0.95 | 0.362 |
| Carries | 4.9162 | 0.5645 | 8.71 | 0.000 |

- For each term, **H₀: coefficient = 0** (the term has no effect). T = Coef divided by SE Coef:

$$T = \\dfrac{4.9162}{0.5645} = 8.71$$

- **P for the slope < 0.05** → carries is a significant predictor.
- The **ANOVA p-value** (F = 75.85, P = 0.000) tests the whole equation. The book: p < 0.05 means "the Regression Equation is significant".
- The constant’s p-value (0.362) does not matter for deciding if X is useful.

In simple regression, the slope’s p-value and the ANOVA p-value are the same test.`},{heading:"How to decide: the regression roadmap",body:`The book’s steps for regression (p. 449):

1. Make a **scatter plot**.
2. Check **correlation** (p < 0.05).
3. Run a **fitted line plot** (linear).
4. Run **regression** and look for unusual observations.
5. Evaluate **R², adjusted R² and p-values**.
6. Try **non-linear** (quadratic/cubic) fits if needed (4.2.1).
7. **Analyse residuals** to validate the assumptions (4.1.3).

A model is only usable if it is statistically significant (p < 0.05), explains enough variation (high R²), and passes the residual checks. Remember: regression uses historical data, so it shows a relationship, not proof of cause.`}],keyPoints:["Simple linear regression: Ŷ = b₀ + b₁X; b₀ = intercept (Y at X = 0), b₁ = slope (change in Y per one unit of X).","Least squares: b₁ = Sxy ÷ Sxx, b₀ = Ȳ − b₁X̄.","R² = SS Regression ÷ SS Total = % of Y variation explained by the model.","Adjusted R² penalises extra terms; it matters most in multiple regression.","S = √MS Error = standard deviation of residuals; smaller is better.","p < 0.05 for the slope (or ANOVA) → the equation is significant.","Predict only within the range of X used to build the model."],examTips:["Most common calculation: plug X into the equation. Watch signs (a negative intercept) and units.","You may need R² from an ANOVA table: SS Regression ÷ SS Total – not SS Error ÷ SS Total.","Trap: a high R² does not prove causation, and it does not prove the model is valid – residuals must also be checked.","Know which p-value to read: the predictor’s p-value (or ANOVA p), not the constant’s.","The slope’s sign always equals the sign of r."]},{topic:"4.1.3",title:"Residuals Analysis",pages:"Book pp. 436–443",doc:"book-401-500",pdfPage:39,intro:"A residual is the **error** of the model for one data point: the observed Y minus the predicted Y. Residual analysis checks whether these errors behave like random noise. If they do not, the regression equation cannot be trusted, even with a high R².",sections:[{heading:"What a residual is",body:`For each observation:

$$e_i = Y_i - \\hat{Y}_i \\quad (\\text{observed} - \\text{fitted})$$

A positive residual means the point lies **above** the line; a negative one means **below**. The sum of residuals in least-squares regression is always zero.

**Book example (Payton, observation 3):** 339 carries, actual yards 1,852, fitted yards 1,503.1.

$$e_3 = 1852.0 - 1503.1 = 348.9$$

The model under-predicted this season by about 349 yards. The residuals together form the "model error" – the 12.7% of variation that R² did not explain. Their spread is summarised by S, the standard deviation of the residuals.

Why study residuals? A regression is only valid when its errors are **pure random noise**. If the residuals show a shape, a trend or a growing spread, the model is missing something – a curve, a time effect or another X. The book places residual analysis as the **last step** of every regression (step 7), and repeats it for multiple regression.`},{heading:"The three assumptions (as in ANOVA)",body:`The book says the residuals should:

1. **Be normally distributed** → check the **normal probability plot** of residuals (and the histogram).
2. **Be independent** of each other → no patterns; data in **time order** → check **residuals versus order**.
3. **Have constant (equal) variance** → check **residuals versus fitted values**: about the same number of points above and below zero, equally spread.

| Assumption | Plot to use | Good sign |
|---|---|---|
| Normality | Normal probability plot | points near a straight line |
| Equal variance | Residuals vs fits | random band, no funnel |
| Independence | Residuals vs order | no trend, no cycles |

In Minitab, choose **Graphs > Four in one** in the Fitted Line Plot or Regression dialog to see all four plots at once.`},{heading:"How to read each plot",body:`**Normal probability plot:** the residuals should lie close to the straight line – "within a fat pencil" (a phrase from Dr. Douglas Montgomery). S-curves or bent tails suggest non-normal errors.

**Residuals vs fitted values:** you want a **random scatter** in a level band. A **funnel** (spread growing as fitted values grow, or shrinking) means **unequal variance**. A **curved** pattern (U or arch) means the straight line is the wrong shape – try a quadratic model (4.2.1).

**Residuals vs order:** should show **no trend up or down**, no runs and no cycles, with roughly equal numbers of points above and below zero. A trend means the errors depend on time (for example tool wear or a shift change), so the independence assumption fails.

**Histogram:** should look roughly bell-shaped. With few points it is the weakest of the four plots.`},{heading:"Standardized residuals and the R flag",body:`Minitab often plots **standardized residuals** (also called Studentized or internally Studentized residuals). A standardized residual is the residual divided by an estimate of its own standard deviation. This puts all residuals on a common scale and makes outliers easier to see.

**Rule:** standardized residuals **greater than +2 or less than −2** are large. Minitab lists them under **Unusual Observations** with the letter **R**.

Payton observation 3: residual 348.9, SE Fit 49.3, MS Error 23,711.

$$\\text{St Resid} = \\dfrac{348.9}{\\sqrt{23711 - 49.3^2}} = \\dfrac{348.9}{145.9} = 2.39 \\;\\Rightarrow\\; \\text{flagged } 2.39R$$

An R point is not automatically removed. First check for a data error or a special cause. Several R points can also be a sign that a curved model fits better.`},{heading:"Deciding: is the model valid?",body:`Use the model only when **all three assumptions** are met. The book’s Dorsett exercise shows the ideal: points near the line on the normal plot, a random band on the fits plot, and no trend on the order plot – "all three assumptions have been satisfied".

Note on normality tests: the Dorsett plot shows an **Anderson-Darling p-value of 0.510** (> 0.05, so fail to reject normality). However, the book says it is technically **inappropriate** to rely on an AD test for residuals, because residuals are not fully independent. The visual "fat pencil" check is preferred.

If assumptions fail:

- curvature in residuals vs fits → try a **quadratic or cubic** model;
- funnel shape or non-normal errors → consider a **transformation** (Box-Cox, 4.2.5);
- trend over time → look for a time-related X that is missing from the model.`}],keyPoints:["Residual = observed Y − fitted Y; it is the model error for one point.","Three assumptions: normal, independent, equal variance.","Normal probability plot → normality; residuals vs fits → equal variance; residuals vs order → independence.","Good residual plots show random scatter: no funnel, no curve, no trend.","Standardized residual beyond ±2 → flagged R in Minitab’s Unusual Observations.","A high R² does not make a model valid; residuals must pass too."],examTips:["Matching question: be sure which plot checks which assumption. Order plot = independence, NOT normality.","A funnel shape means unequal variance; a curved band means the model shape is wrong (try quadratic).","Compute a residual as actual − predicted (not predicted − actual); the sign matters.",'"R" = large standardized residual (|value| > 2). "X" = unusual X value with large influence – different flags.']},{topic:"4.2.1",title:"Non-Linear Regression",pages:"Book pp. 449–456",doc:"book-401-500",pdfPage:52,intro:"Not every relationship is a straight line. Non-linear regression fits a **curve** – usually a quadratic (X²) or cubic (X³) term – when a straight line misses the shape of the data. The goal is to explain more of the variation in Y with errors that look random.",sections:[{heading:"Curved models in the book",body:`The book lists these prediction equations:

- **Quadratic (2nd order):** $Y = a + bX + cX^2$ – one bend.
- **Cubic (3rd order):** $Y = a + bX + cX^2 + dX^3$ – up to two bends.
- **Exponential:** $Y = a \\cdot b^X$.
- Logarithmic and inverse shapes are also common.

These are still fitted by least squares in Minitab (Stat > Regression > Fitted Line Plot, then choose **Quadratic** or **Cubic** as the model type). There is still **one X and one Y**; the extra terms are powers of the same X.

The book’s quiz key says all of these can be modelled with a regression equation: simple linear, quadratic, cubic, multiple linear and logarithmic.`},{heading:"How to spot a non-linear relationship",body:`The book gives four signals:

1. The **scatter plot shows curvature**.
2. **Unusual observations** (R flags) appear in the linear model.
3. The **residuals vs fitted values** plot of the linear model shows a **trend or curve** (clusters above, then below, then above zero).
4. **Subject-matter experts** or the team know the process is curved.

Step 6 of the book’s regression roadmap is "Run non-linear regression **if necessary**". It is not automatic. You try it when the straight line is weak, shows these signals, or its residual assumptions are not met.`},{heading:"How to decide: compare the models",body:`The book’s rule: use the curved model **if R² improves significantly, or if the residual assumptions are better met**. Compare:

- **R² and adjusted R²** – adjusted R² must also rise; if it falls, the extra term is not worth it.
- **S** – the standard deviation of the model error; it should fall.
- **p-value of the new term** – in the Sequential ANOVA, the quadratic line must have p < 0.05.
- **Residual plots** – the curve should remove the pattern.

**Counter-example (Payton):**

| Model | R² | R²(adj) | S |
|---|---|---|---|
| Linear | 87.3% | 86.2% | 154.0 |
| Quadratic | 87.3% | 84.8% | 161.5 |
| Cubic | 88.2% | 84.3% | 164.2 |

R² hardly moves, adjusted R² **falls** and S **rises**. The book’s decision: "stick with the linear model". Simpler is better when the curve adds nothing.`},{heading:"Book example: ore concentrator",body:`A mining company relates **PGM concentrate (g/ton)** to **agitator RPM** (12 points). Correlation r = 0.847, p = 0.001.

**Linear fit:** PGM = 1.119 + 1.333 × RPM, R² = 71.8%, R²(adj) = 69.0%, S = 9.08. Observation 3 is flagged **−2.41R** – a hint of curvature.

**Quadratic fit:** PGM = 30.53 − 1.460 RPM + 0.05586 RPM², R² = **82.2%**, R²(adj) = **78.2%**, S = **7.61**.

Sequential ANOVA:

| Source | DF | SS | F | P |
|---|---|---|---|---|
| Linear | 1 | 2101.07 | 25.47 | 0.001 |
| Quadratic | 1 | 302.97 | 5.22 | 0.048 |

The quadratic term has **p = 0.048 < 0.05**, R² and adjusted R² both rise, and S falls. The curve is the better model. The extra variation explained by the X² term is:

$$\\dfrac{302.97}{2925.93} = 0.104 \\approx 10.4\\% \\;\\; (71.8\\% \\to 82.2\\%)$$`},{heading:"Second example: mailing response",body:`A store relates **% response** to a coupon to **% discount** (16 points). r = 0.972, and the linear fit already has R² = 94.5%, S = 5.61. But the scatter plot curves upward.

Quadratic fit: % response = −0.416 + 0.1526 × discount + 0.04166 × discount²; **R² = 98.6%**, R²(adj) = 98.4%, **S = 2.91**; quadratic term p = 0.000.

Even a high-R² straight line can be improved when the shape is curved. To predict with a quadratic model, square X first. At an 18% discount:

$$\\hat{Y} = -0.416 + 0.1526(18) + 0.04166(18^2) = -0.416 + 2.747 + 13.498 = 15.8\\%$$

This model is used again for confidence and prediction intervals (4.2.3). Always finish by checking the residuals of the chosen model.`}],keyPoints:["Non-linear (curvilinear) regression adds X², X³ … terms of the same X to fit a curve.","Signs of curvature: curved scatter plot, R-flagged points, patterned residuals vs fits, expert knowledge.","Choose the curve only if R² rises meaningfully, adjusted R² rises, S falls and the new term has p < 0.05.","If adjusted R² falls and S rises (Payton), keep the simpler linear model.","Ore example: quadratic R² 71.8 → 82.2%, S 9.08 → 7.61, quadratic p = 0.048.","Residual assumptions must still be checked after fitting the curve."],examTips:["Model comparison questions: look at adjusted R² and S, not R² alone – R² never falls when you add a term.",'In a Sequential ANOVA table, the p-value on the "Quadratic" line tells you if the curve is needed.',"When predicting from a quadratic, remember to square X (18² = 324) before multiplying.","Trap: a curved pattern in residuals vs fits points to non-linearity, not to unequal variance."]},{topic:"4.2.2",title:"Multiple Linear Regression",pages:"Book pp. 462–469",doc:"book-401-500",pdfPage:65,intro:"Multiple linear regression (MLR) models **one Y with two or more X’s at the same time**. It is used when one X does not explain enough of the variation, or when process knowledge says several inputs matter. The challenge is choosing which X’s to keep.",sections:[{heading:"When and why to use MLR",body:`The book says use MLR when:

- **R² is not high enough** in simple linear regression, or
- **process knowledge** says more than one input affects the output.

Key facts about MLR from the book:

- It uses **historical data**. It is **not a form of experimentation** and does **not replace a DOE**.
- The **residual assumptions** of simple regression still apply (normal, independent, equal variance).
- An **extra assumption**: the predictors (X’s) are **independent of each other** – not correlated. Correlation between X’s is called **multicollinearity**.
- **Measurement error in every X** adds to model error, lowering R² and the confidence in the coefficients.
- Interactions are **not** included in a basic MLR model.`},{heading:"The MLR equation",body:`$$Y = \\beta_0 + \\beta_1 X_1 + \\beta_2 X_2 + \\beta_3 X_3 + \\varepsilon$$

- **Y** – the response (dependent variable).
- **X₁, X₂, X₃** – the predictors (independent inputs).
- **β₀** – the value of Y when **all** X’s equal zero.
- **β₁, β₂, β₃** – **partial regression coefficients**: the change in Y when that X goes up by one unit **while the other X’s stay constant**.
- **ε** – error (residual): observed Y minus predicted Y.

The words "other X’s held constant" are what make a coefficient "partial". Because the X’s are assumed independent, each one gets its own slope.`},{heading:"The six-step MLR roadmap",body:`1. **Matrix plot** (Graph > Matrix Plot) – scatter plots of every pair of variables. Look for X’s related to Y, and for X’s related to each other.
2. **Best Subsets regression** (Stat > Regression > Best Subsets).
3. **Evaluate** R², adjusted R², Mallows Cp, number of predictors and S.
4. **Iteratively** fit the model (Stat > Regression > Regression), removing weak or collinear terms.
5. **Analyse residuals** – normal, equal variance, independence, and no single point that controls the model (4.2.4).
6. **Verify** the model with current process data to confirm the model error.

**Model-selection guidelines** (book p. 464): R² and adjusted R² should be close (much less than 10% apart); adjusted R² should rise as useful terms are added; **Mallows Cp small** and less than the number of terms; **S small**; and a simpler model is preferred when it does almost as well.`},{heading:"Adjusted R² and VIF formulas",body:`Plain R² always rises when you add an X, even a useless one. **Adjusted R²** adds a penalty for each predictor p:

$$R^2_{adj} = 1 - \\dfrac{(1 - R^2)(n - 1)}{n - p - 1}$$

Flight example final model: R² = 85.9%, n = 29, p = 2:

$$R^2_{adj} = 1 - \\dfrac{(0.141)(28)}{26} = 1 - 0.152 = 0.848 = 84.8\\%$$

**Variance Inflation Factor (VIF)** measures multicollinearity for predictor j, where $R_j^2$ is the R² from regressing Xⱼ on the other X’s:

$$VIF_j = \\dfrac{1}{1 - R_j^2}$$

Book bands: **VIF = 1** no relation among predictors; **VIF > 1** some correlation; **VIF 5–10** coefficients poorly estimated and unacceptable. (Common exam convention: VIF > 5 is a concern, > 10 is serious.) Temp had VIF 5.4, so $R_j^2 = 1 - \\dfrac{1}{5.4} = 0.81$.`},{heading:"Book example: flight speed",body:`An aircraft maker has 10 months of data: Y = **flight speed**; X’s = altitude, turbine angle, fuel/air ratio, ICR and temp.

1. **Matrix plot:** two or more X’s look related to speed → run MLR.
2. **Best Subsets:** the 5-X model has the highest R²(adj) 87.7%, lowest Cp 6.0, lowest S 18.3 – but many terms.
3. **Full model:** **Temp VIF = 5.4** (and p = 0.200) → remove Temp. Best Subsets need not be re-run.
4. **4-X model:** VIFs now fine, but **altitude p = 0.067 > 0.05** → remove.
5. **3-X model:** **turbine angle p = 0.093 > 0.05** → remove.
6. **Final model:** all p = 0.000, VIF 1.1.

**Flight speed = 1101 + 10.9 × Fuel/Air ratio − 55.2 × ICR**, R² = 85.9%, R²(adj) = 84.8%, S = 20.3.

Prediction for fuel/air ratio 36 and ICR 18:

$$\\hat{Y} = 1101.04 + 10.921(36) - 55.197(18) = 1101.04 + 393.16 - 993.55 = 500.7$$

ICR alone explains most of the variation: $\\dfrac{64549}{76231} = 84.7\\%$ (sequential SS).`}],keyPoints:["MLR = one Y, two or more X’s; uses historical data and is NOT an experiment.","Partial regression coefficient = change in Y per unit of Xᵢ with the other X’s held constant.","Extra MLR assumption: the X’s are independent (no multicollinearity).","VIF = 1 ÷ (1 − Rⱼ²); VIF 1 = none; 5–10 = poorly estimated coefficients → remove a predictor.","Adjusted R² penalises extra terms; R² and R²(adj) should be close (< 10% apart).","Best model: high R²(adj), small Mallows Cp (< number of terms), small S, all p < 0.05, fewest terms.","Remove one non-significant term at a time (largest p first) and re-run."],examTips:['Trap: "MLR is a form of experimentation / replaces a DOE" – false. Only DOE proves cause and effect.',"High VIF → multicollinearity among X’s; it is not a residual problem and not a sign of a good predictor.","Choosing between models: prefer adjusted R² over R²; a model with fewer terms and nearly the same R²(adj) wins.","Prediction questions: substitute every X and watch the signs of negative coefficients.","Measurement error in the X’s lowers R² and the confidence in the coefficients – the book’s quiz marks this true."]},{topic:"4.2.3",title:"Confidence & Prediction Intervals",pages:"Book pp. 454–458",doc:"book-401-500",pdfPage:57,intro:"A regression equation gives one predicted value, but the real world has uncertainty. A **confidence interval (CI)** shows where the **true regression line (the mean Y)** is likely to be. A **prediction interval (PI)** shows where a **single new observation** is likely to fall. The PI is always wider.",sections:[{heading:"Two kinds of interval",body:`The book defines them as follows:

- **Confidence interval:** the range where the **prediction equation** is expected to fall. The true line could differ from the fitted one; with 95% confidence it lies inside the CI bands.
- **Prediction interval:** the range where a **new observation** is expected to fall.

| | CI | PI |
|---|---|---|
| Answers | Where is the average Y at this X? | Where will the next single Y be? |
| Includes | uncertainty in the line | line uncertainty **plus** point-to-point scatter (S) |
| Width | narrower | **wider** |

In Minitab: Stat > Regression > Fitted Line Plot > **Options** > tick **Display confidence interval** and **Display prediction interval**, confidence level 95%. The plot then shows two pairs of curved bands around the fitted line.`},{heading:"Why the bands have this shape",body:`For simple linear regression at a chosen value X₀:

$$CI: \\; \\hat{Y}_0 \\pm t \\cdot S \\sqrt{\\dfrac{1}{n} + \\dfrac{(X_0 - \\bar{X})^2}{S_{xx}}}$$

$$PI: \\; \\hat{Y}_0 \\pm t \\cdot S \\sqrt{1 + \\dfrac{1}{n} + \\dfrac{(X_0 - \\bar{X})^2}{S_{xx}}}$$

What this tells you (no need to memorise the formulas):

- The PI has an **extra "1"** under the root – the scatter of single points. So **PI > CI** at every X.
- Both are **narrowest at X̄** and **flare out at the ends**, because $(X_0 - \\bar{X})^2$ grows. The book notes the CI flares at the extremes, where less data supports the line.
- More data (larger n) makes the CI much narrower. The PI shrinks too, but it can never be narrower than about ±t·S.
- A higher confidence level (99% vs 95%) makes both wider.`},{heading:"Book example: what discount gives a 10% response?",body:`A retail chain mails coupons. The question: **what discount is needed to get at least a 10% response?** The quadratic model is used (R² = 98.6%, S = 2.91):

% response = −0.416 + 0.1526 × discount + 0.04166 × discount²

**Method in the book:**

1. Draw a **horizontal line at 10%** response.
2. Find where it meets the **lower 95% prediction-interval band**.
3. Drop a **vertical line** to the X-axis → about **18% discount**.

**Conclusion:** with 95% confidence, an 18% discount gives between about **10% and 23%** response from a mailing. The centre (fitted) value is:

$$\\hat{Y} = -0.416 + 0.1526(18) + 0.04166(324) = 15.8\\%$$

Using the fitted line alone at 10% would give a smaller discount – and about half of the mailings would then get **less** than 10%.`},{heading:"How to decide which interval to use",body:`Ask: is the goal about the **average** or about **one result**?

- "What is the **mean** cycle time when we run at 40 units/hour?" → **CI**.
- "Will **this next batch** meet the spec?" or "What setting **guarantees** a minimum result?" → **PI**.

For specifications and guarantees, the PI is the safe choice, because customers experience single results, not averages. The book: the prediction interval "will provide a degree of confidence in how the customers will respond", which is more important than the equation itself.

**Before using any interval**, check the residuals (step 7). In the mailing example, all three assumptions are met: normal, random over order, and similar spread over the fitted values. Only then is the 18% recommendation trusted.`}],keyPoints:["CI = range for the true regression line (mean Y at a given X).","PI = range for one new individual observation at a given X.","PI is always wider than CI because it adds the scatter of individual points.","Both bands are narrowest at X̄ and flare out at the extremes of X.","Mailing example: lower 95% PI at 10% response → 18% discount; response 10–23%.","Higher confidence level → wider intervals; more data → narrower CI.","Residual assumptions must hold before the intervals can be trusted."],examTips:['Classic question: "which interval for a single future value?" → prediction interval.',"Trap: saying the CI is wider, or that both have the same width – the PI is always wider.","To guarantee a minimum Y, read the LOWER prediction band, not the fitted line.","Trap: intervals are narrowest at the mean of X, not at the smallest X."]},{topic:"4.2.4",title:"Residuals Analysis",pages:"Book pp. 462–470",doc:"book-401-500",pdfPage:65,intro:'In multiple regression, residual analysis is still the final validity check, but there is more to look at: the usual three residual assumptions, **multicollinearity among the X’s**, and points with **large influence**. The book calls this check "VITAL" once a final model is chosen.',sections:[{heading:"What carries over from simple regression",body:`Step 5 of the MLR roadmap says: analyse residuals (Stat > Regression > Regression > Graphs, **Four in one**). The same three assumptions apply:

| Assumption | Plot |
|---|---|
| a. Normally distributed | Normal probability plot (and histogram) |
| b. Equal variance | Residuals vs fitted values |
| c. Independence | Residuals vs order of data |

Plus a fourth check: **d. confirm that one or two points do not overly influence the model**.

Residuals in MLR are still observed minus predicted: $e_i = Y_i - \\hat{Y}_i$. The only difference is that Ŷ now comes from several X’s. The book also notes that model error in MLR includes the **measurement error of every input**, so a poor measurement system on any X inflates the residuals.`},{heading:"The extra MLR check: multicollinearity",body:`MLR adds one assumption: **the predictors are independent of each other**. When X’s are correlated (multicollinearity):

- coefficients become unstable and can even take the wrong sign;
- standard errors grow, so p-values look worse than they should;
- it becomes hard to say which X really matters.

Minitab detects it with the **Variance Inflation Factor**:

$$VIF_j = \\dfrac{1}{1 - R_j^2}$$

| VIF | Meaning (book) |
|---|---|
| 1 | no relation among predictors |
| > 1 | some correlation |
| 5 – 10 | coefficients poorly estimated – unacceptable |

Flight example: **Temp VIF = 5.4** → remove Temp. After removal all VIFs were 1.1–1.9. A matrix plot (step 1) also shows X’s that move together.`},{heading:"Unusual observations: R and X flags",body:`Minitab lists two kinds of unusual point:

- **R** – a **large standardized residual** (beyond ±2). The model fits this point badly.
- **X** – an observation **whose X value gives it large influence** (high leverage). It sits far from the other X values and can pull the line.

Final flight model:

| Obs | Fuel/Air | Speed | Fit | Residual | St Resid |
|---|---|---|---|---|---|
| 1 | 40.6 | 618.00 | 624.29 | −6.29 | −0.38 **X** |
| 22 | 36.3 | 578.00 | 524.45 | 53.55 | 2.74 **R** |

Residual for obs 22:

$$e_{22} = 578.00 - 524.45 = 53.55$$

Obs 1 has a small residual but an unusual X – it may control the slope. Obs 22 fits badly. Both deserve a look.`},{heading:"Deciding what to do",body:`The book’s advice on obs 22: "Consider removing this outlier **but be careful**" – this is historical data with no further information. Rules of thumb:

1. **Investigate first:** data-entry error, measurement error or a known special cause? If yes, correct or remove it and say so.
2. **Never delete a point just to raise R².**
3. Check if the model changes much with and without the point (influence check d).

Then read the four-in-one plots. For the flight model: residuals near the line on the normal plot, a random band across fitted values 450–650, and no trend across 29 observations. The book concludes "our model is valid and the residuals are satisfactory".

If plots fail: curvature → add a squared term; funnel or skew → transform Y (Box-Cox); trend over time → a missing time-related X. Finally (step 6) **verify** the model with current process data, then use a DOE to prove cause and effect.`}],keyPoints:["MLR residuals must still be normal, independent and of equal variance.","Four-in-one: normal plot → normality; vs fits → equal variance; vs order → independence.","MLR adds checks for multicollinearity (VIF) and for influential points.","VIF = 1 ÷ (1 − Rⱼ²); VIF 5–10 → coefficients poorly estimated; remove a predictor.","R flag = large standardized residual (|St Resid| > 2); X flag = large influence from an unusual X value.","Investigate unusual points before removing them; never remove only to improve R².","Measurement error in any X increases model error."],examTips:["Know the difference: R = poor fit (Y direction); X = unusual predictor value with high leverage.","A high VIF is about the X’s being correlated with each other – not about residual normality.","Matching items reuse the simple-regression plot-to-assumption pairs; they do not change in MLR.",'Trap: "remove every flagged point" – the book says be careful; investigate the cause first.']},{topic:"4.2.5",title:"Data Transformation, Box Cox",pages:"Book pp. 459–462",doc:"book-401-500",pdfPage:62,intro:"A transformation applies a mathematical function – a power, a root or a log – to every data value. It can make **skewed data look normal** or turn a **curved relationship into a straight line**. The **Box-Cox** procedure finds the best power, called **lambda (λ)**.",sections:[{heading:"Why transform data",body:`When data is non-linear, the book gives two ways to do regression:

- **non-linear regression** (4.2.1), or
- **linear regression on transformed data** – either X or Y may be transformed.

**Advantages:**

- linear regression is easier to see and manage;
- non-normal data can be made to look normal for tools that need normality (capability, t-tests, control charts).

**Disadvantages:**

- **transformed units are hard to understand** (what is a "square-root minute"?);
- hard to do without computers;
- results must be **back-transformed** to explain them, which is not always easy.

Skewed data becomes more symmetric with a function that acts **more strongly on large numbers** than small ones, such as roots and logs.`},{heading:"Four transformation rules",body:`The book lists four rules:

1. The transform must **preserve the relative order** of the data.
2. It must be a **smooth and continuous function**.
3. It is most useful when **largest ÷ smallest value > 2**. If the ratio is smaller, the transform has little effect.
4. **All external reference points (spec limits, targets) must use the same transform.**

Rule 3 example: data from 5 to 40 gives

$$\\dfrac{40}{5} = 8 > 2$$

so a transform can help. Data from 50 to 60 gives 1.2 – a transform would change almost nothing.

Rule 4 is often tested. If you transform the data but not the specs, the capability result is wrong.`},{heading:"The power table and lambda",body:`Most transforms are powers of x: $x_{trans} = x^{\\lambda}$, with **λ = 0 meaning log(x)**.

| λ (power) | Transform |
|---|---|
| 3 | cube, x³ |
| 2 | square, x² |
| 1 | **no change** |
| 0.5 | **square root**, √x |
| 0 | **logarithm**, ln x |
| −0.5 | reciprocal root, 1 ÷ √x |
| −1 | reciprocal, 1 ÷ x |

- **λ < 1** (root, log, reciprocal) pulls in a long **right tail** – the common case for times, costs and counts.
- **λ > 1** (square, cube) stretches the right side to fix **left skew**.
- **λ = 1** means the data needs no transform.

The book says the **square root and natural log** are the most common standard transforms.`},{heading:"Box-Cox in Minitab: book example",body:`Box-Cox searches many λ values and picks the one that gives the **smallest standard deviation** of the standardized transformed data (the lowest point of the Box-Cox curve). Path: Stat > Control Charts > Box-Cox Transformation.

Book data "Pos skew" (n = 100, right-skewed):

| Box-Cox output | Value |
|---|---|
| Estimate λ | 0.34 |
| 95% CI for λ | 0.14 to 0.54 |
| **Best (rounded) value** | **0.50** |

Minitab rounds to a convenient value inside the CI → **λ = 0.5 = square root**. If the CI for λ **contains 1**, no transform is needed.

**Check the result** with a normality test (Stat > Basic Statistics > Normality Test):

- before: Anderson-Darling **p < 0.005** → not normal;
- after √x: AD = 0.265, **p = 0.687** → fail to reject normality.

The book also does it by hand (Calc > Calculator, SQRT) and gets the same result.`},{heading:"Worked example: transforming spec limits",body:`Rule 4 says specs must be transformed too. With **λ = 0.5**, USL = 100 and LSL = 4:

$$USL_{trans} = \\sqrt{100} = 10 \\qquad LSL_{trans} = \\sqrt{4} = 2$$

This matches the book’s quiz: λ = 0.5 turns a USL of 100 into 10.

**Watch negative λ.** With λ = −1 (reciprocal):

$$USL_{trans} = \\dfrac{1}{100} = 0.01 \\qquad LSL_{trans} = \\dfrac{1}{4} = 0.25$$

Now the transformed "USL" is **smaller** than the "LSL" – their order is reversed. So the book’s quiz says it is **NOT true** that the USL always stays the larger number after a transform. Exam point: do not assume the order of the limits stays the same; re-check which transformed limit is the upper one.

With λ = 0: $\\ln(100) = 4.61$ and $\\ln(4) = 1.39$.`}],keyPoints:["Transform to make non-normal data normal, or to straighten a curved relationship for linear regression.","Box-Cox finds the power λ: x^λ, with λ = 0 meaning ln(x).","λ = 1 no change; 0.5 square root; 0 natural log; −1 reciprocal; 2 square.","Rules: preserve order, smooth and continuous, useful when max ÷ min > 2, transform the specs too.","Box-Cox picks λ with the smallest standard deviation; the rounded value inside the CI is used.","Always confirm with a normality test after transforming (book: p < 0.005 → 0.687).","Main disadvantage: transformed units are hard to understand and to reverse."],examTips:["Most common calculation: transform a spec limit (λ = 0.5 → √USL; λ = 0 → ln USL).",'Trap: "transform the data but not the specs" – always false.','Trap: "the USL is always larger than the LSL after transforming" – not true for negative λ.',"If the Box-Cox confidence interval for λ includes 1, no transformation is needed.","Know λ ↔ transform pairs by heart: 0.5 = square root, 0 = log, −1 = reciprocal."]}],Ne=Object.freeze(Object.defineProperty({__proto__:null,lessons:Be},Symbol.toStringTag,{value:"Module"})),Fe=[{topic:"2.1.1",title:"Cause & Effect / Fishbone Diagrams",pages:"Book pp. 98, 113–114, 118–119, 131 (the main fishbone teaching pages come before the supplied book)",doc:"book-101-200",pdfPage:1,intro:"A **fishbone diagram** (also called a cause and effect diagram or Ishikawa diagram) is a picture that lists **all the possible causes (X's)** of one problem (Y). The team builds it together, so it collects the knowledge of the people who do the work. It is one of the first Measure tools for finding X's, and its output feeds the X-Y matrix and the FMEA.",sections:[{heading:"What a fishbone diagram is",body:`The book's glossary defines it as a **pictorial diagram in the shape of a fishbone that shows all possible variables that could affect a given process output** (p. 584).

- The **head** of the fish is the **effect**: the problem (Y) from your problem statement, for example "pizzas burnt".
- The **bones** are **categories of causes**. Small bones on each big bone are the detailed causes (X's).

Why do we need it? Remember $Y = f(X)$. To improve a Y you must first find all the X's that might drive it. The book names **three primary sources of X's** (p. 118):

1. Process mapping
2. **Fishbone analysis**
3. Basic data analysis (graphical and statistical)

The book's exercise (p. 98) says: take the **high-level process map** of your project and use it to build a fishbone, **with your project team** if possible. The process steps help the team think of causes at each step.`},{heading:"How to build one, step by step",body:`1. **Write the effect** in the head. Make it specific and measurable (one Y, as in your problem statement).
2. **Draw the main bones.** A common set is the **6Ms**: Man (People), Machine, Method, Material, Measurement and Mother Nature (Environment). Service teams often use the 4Ps (Policies, Procedures, People, Plant) or the 4Ss (Surroundings, Suppliers, Systems, Skills). Use the categories that fit your process.
3. **Brainstorm causes** on each bone. Walk through the process map step by step. Everyone speaks; no idea is judged yet.
4. **Go deeper.** For each cause ask "why does this happen?" again and again (the **5 Whys**). Add each answer as a smaller bone.
5. **Classify each cause** as Controllable, Procedural or Noise (next section).
6. **Keep it as a team document.** It is organised brainstorming, not proof.

Note: the 6M list, 4Ps/4Ss and 5 Whys are standard Lean Six Sigma practice. The supplied book pages do not contain the book's own fishbone construction page.`},{heading:"Classifying causes: C, P and N",body:`Every input can be put into one of three classes (book pp. 113–114):

| Class | Meaning | Examples from the book |
|---|---|---|
| **Controllable (C)** | Can be adjusted or controlled while the process runs | Speed, feed rate, temperature, pressure; oven temperature, bake time |
| **Procedural (P)** | Affected by a standardised set of activities that complete a step | Material queues, rigging set-up, fixed data-entry forms; the recipe SOP |
| **Noise (N)** | We think we cannot control it, we do not know about it, or it is too expensive or difficult to control | Ambient temperature, humidity, the individual; room temperature, ingredient variation |

Even a controllable input is never under complete control: it still varies naturally within its limits. The book also warns that some noise inputs are noise only because **we do not know they exist**. If an X turns out to be a **critical X**, by definition you must control it, so it must have requirements and must be measured.`},{heading:"Where the causes go next",body:`The fishbone is not the end. Its causes are routed to other Measure tools (pp. 119, 131):

- **Controllable X's → X-Y matrix.** Breakthrough needs mainly controllable X's. The X-Y matrix ranks them to find the vital few.
- **Procedural and Noise X's → FMEA.** All procedures must be in **total compliance** (this may need an effectiveness measure). Noise inputs **raise the risk** of defects, so they increase the RPN and show where investment may be justified.
- In the FMEA, the **Class** column (C/P/N) and the **Potential Causes of Failure** column both come from the fishbone.

Remember the book's warning (p. 118): team tools like this are **"not real data"**. Data analysis later may show that a cause the team felt sure about is not important. The Measure phase identifies and prioritises X's; the **Analyze** phase proves or disproves their impact (roadmap, p. 230).`},{heading:"Worked example: burnt pizzas",body:`The book's pizza restaurant has a problem with burnt pizzas and late deliveries (p. 115). The team puts **"Pizza burnt"** in the head and uses the process map steps from "add ingredients" to "remove from oven".

| Bone | Cause found | Class |
|---|---|---|
| Machine | Oven temperature drifts above 350°F | C |
| Method | Cook "observes frequently" instead of using a timer | P |
| Material | Some toppings burn faster than others | C |
| People | New cook not trained on the recipe chart | P |
| Measurement | No oven thermometer check | P |
| Environment | Kitchen very hot at peak hours | N |

Next steps: oven temperature, bake time and topping choice go to the **X-Y matrix** to be ranked. The timer method, training and thermometer checks (procedural) and kitchen heat (noise) go to the **FMEA**. Then the team collects data on the top X's to test them.`}],keyPoints:["Fishbone = cause and effect diagram = Ishikawa diagram.","The head is the effect (Y, the problem); the bones are categories of possible causes (X's).","Common categories: 6Ms — Man, Machine, Method, Material, Measurement, Mother Nature.","Three sources of X's: process mapping, fishbone analysis, basic data analysis.","Classify every cause as Controllable (C), Procedural (P) or Noise (N).","Controllable X's go to the X-Y matrix; procedural and noise X's go to the FMEA.","A fishbone is organised brainstorming, not data — Analyze must confirm the causes."],examTips:['If a question asks which tool "generates ideas about possible causes" of a defect, the answer is the fishbone, not the Pareto chart or the FMEA.',"The fishbone does not rank or prove causes. Ranking is the X-Y matrix; proof comes from data in Analyze.","Know C/P/N examples: temperature or speed = controllable; SOP or data-entry form = procedural; humidity or ambient temperature = noise.",'Trap: "Measurement" is one of the 6Ms — it is a cause category, not the effect.']},{topic:"2.1.2",title:"Process Mapping, SIPOC, Value Stream Map",pages:"Book pp. 99–117",doc:"book-101-200",pdfPage:2,intro:"A **process map** (flowchart) is a picture of the tasks, steps and decisions that turn inputs into an output. The book calls it the most important and powerful tool for improving a process, and mapping is **the first activity of the Measure phase**. SIPOC and the value stream map are special kinds of map that add suppliers, customers, requirements and timing data.",sections:[{heading:"Why we map the process",body:`The preferred way to describe a process is: give it a **generic name**, show the workflow with a **process map**, and describe its purpose with an **operational description** (p. 99).

Mapping gives you information for later tools (p. 100):

- Process **inputs (X's)** and supplier requirements
- Process **outputs (Y's)** and real customer needs
- **Value-added and non-value-added** steps
- **Data collection points** (cycle times, defects, inventory, cost of poor quality)
- Decision points, quick fixes and control needs

There are usually **three views** of a process:

1. What you **think** it is
2. What it **actually** is
3. What it **should** be

The real process is almost always bigger, harder and more costly than people think, with hidden operations. You find the "actual" view by **walking the process** with the team. The "should be" view is the result of your project.`},{heading:"Symbols and the three levels",body:`**Standard symbols** (p. 101):

| Symbol | Meaning |
|---|---|
| Rectangle | Activity — text starts with a verb |
| Parallelogram | Data |
| Diamond | Decision — only two paths: Yes and No |
| Ellipse | Start or end of the process |
| Arrow | Direction of flow |
| Circle with a letter or number | Continues on another page |

**Three levels** (pp. 102–103), used like world, country and city maps:

- **Level 1 – Macro** (management view): only major steps, minimal detail, shows where the process fits in the big picture. Usually 4–8 steps. Add at least one step before and one after the area that contains your problem.
- **Level 2 – Process map** (worker view): the major steps as the worker does them, with decisions.
- **Level 3 – Micro** (improvement view): more steps and **performance data** — yields, cycle times, VA/NVA time, defects, DPU and rolled throughput yield (RTY).`},{heading:"Four types of map and how to build them",body:`The book uses **four types** of process map (p. 103):

1. **Linear flow map** — steps in sequence, left to right. Most people start here.
2. **Swim lane (deployment) map** — one lane per person or department. It shows **who** does each step. Each time work crosses a lane there is a supplier–customer hand-off, and this is **where bottlenecks and queues usually form**.
3. **SIPOC** — suppliers, inputs, process, outputs, customers.
4. **Value stream map** — speed, queues and performance data.

**Team approach** (preferred; p. 107): agree the macro map, tape one sheet per macro step on the wall, and let process members write **one task per post-it**, with the actual work time (no waiting time). Consolidate into a Level 2 map at once, then **verify it by walking the process**. The team approach is faster, gives better quality and more buy-in than interviewing people one by one.`},{heading:"SIPOC and customer requirements",body:`**SIPOC** stands for **S**uppliers, **I**nputs, **P**rocess, **O**utputs, **C**ustomers; requirements can be added on both sides (p. 111). It answers: who supplies the inputs, what are all the inputs, what specs are on them, what are all the outputs, who are the true customers, and what do they require?

**Preferred order to build it:**
1. Outputs → 2. Customers → 3. Customer requirements → 4. Inputs → 5. Suppliers → 6. Input requirements.

The process ("P") is a high-level map of about 4–8 steps.

Book example (pizza order process): supplier ATT (phones); inputs pizza type, size, address; outputs price, bake order; customer the cook; requirements "complete call < 3 min" and "order to cook < 1 minute".

**RUMBA** tests whether a requirement is valid: **R**easonable, **U**nderstandable, **M**easurable, **B**elievable, **A**chievable (p. 112). If it fails any of these, you must **negotiate** with the customer. Every output should have a metric, LSL, target and USL.`},{heading:"Value-added versus non-value-added",body:`Activities that use resources but do not create value are **waste**. To test each step, ask the book's **two questions** (p. 117):

1. Is the **form, fit or function** of the work item changed by this activity?
2. Is the **customer willing to pay** for this activity?

If the answer is no, the step is **non-value-added (NVA)**. Mark it on the map with a red X or write "NVA".

**Hint from the book:** a step that starts with **"re"** — rework, replace, review, rewrite — is very likely waste.

Some NVA steps cannot be removed. For example, data must be collected for planning or to meet **government regulations**, even though it does not change the product. These are kept, but made as small as possible.

The goal of the VA/NVA test is to **remove unnecessary activity** from the process.`},{heading:"Value stream map with a worked example",body:`A **value stream map** shows the speed of the process, queue sizes and performance for each major step. It is very good for **finding bottlenecks** (p. 105).

Book example (a mail-handling step "Log"): queue = 4,300 items, cycle time C/T = 15 s, shift 8 h, breaks 0.5 h, uptime 0.90.

**Available time per day:**
$$\\text{Available} = (8 - 0.5) \\times 0.90 = 6.75 \\text{ h} = 24{,}300 \\text{ s}$$

**Days of work in queue:**
$$\\text{Days in queue} = \\dfrac{\\text{queue} \\times \\text{cycle time}}{\\text{available time}} = \\dfrac{4{,}300 \\times 15}{24{,}300} = 2.65 \\text{ days}$$

For the "Route" step (7,000 items, C/T 75 s, uptime 0.95, 25,650 s available) the same formula gives **20.47 days** — the biggest queue.

**Rolled throughput yield** multiplies the first-pass yield of every step:
$$RTY = 0.92 \\times 0.94 \\times 0.59 \\times 0.96 \\times 0.96 = 0.47$$

So only 47% of items pass all five steps first time. The step with yield 0.59 is the quality bottleneck.`}],keyPoints:["Process mapping is the first activity of the Measure phase.","Three views: what you think it is, what it actually is, what it should be.","Diamond = decision (Yes/No only); rectangle = activity starting with a verb; ellipse = start/end.","Level 1 = macro/management; Level 2 = worker view; Level 3 = micro/improvement view with performance data.","Four map types: linear flow, swim lane, SIPOC, value stream map.","SIPOC build order: outputs, customers, customer requirements, inputs, suppliers, input requirements.","VA test: does it change form, fit or function, and will the customer pay for it?","RTY = product of the yields of all steps."],examTips:["Questions often ask which map shows who is responsible or where hand-offs happen: that is the swim lane map.","SIPOC is a high-level tool (about 4–8 process steps); it does not show detailed decisions.","Know RUMBA: Reasonable, Understandable, Measurable, Believable, Achievable.",'Trap: "review", "rework" and "inspect" steps are non-value-added even if they are required.',"For RTY, multiply step yields; do not average them."]},{topic:"2.1.3",title:"X-Y Diagram",pages:"Book pp. 118–123",doc:"book-101-200",pdfPage:21,intro:`The **X-Y diagram** (X-Y matrix, also called a cause and effect matrix) is a team tool that **ranks the possible X's** by how strongly they affect the important Y's. It turns a long list of causes into a short list of the "vital few" to study first. It is based on team opinion, not on hard data.`,sections:[{heading:"What the X-Y matrix is",body:`The book defines the X-Y matrix as (p. 118):

- A tool to **identify and collate potential X's** and assess their **relative impact on multiple Y's** (include all customer-focused Y's)
- **Based on the team's collective opinions** ("tribal knowledge")
- **Created for every project**
- **Never completed** — it is **updated whenever a parameter changes**

In short: **a team-based prioritisation tool for the potential X's.**

The book gives a strong **warning**: this is **not real data**; it is organised brainstorming. At the end of the project you may find that X's the team thought were critical are not important. Still, the matrix is valuable because it is a fairly unbiased way to focus the team.`},{heading:"Where the X's come from",body:`A Belt does not just "discover" the vital few. The team first considers **all possible X's** that could cause the problem, using the **three primary sources** (p. 118):

1. Process mapping
2. Fishbone analysis
3. Basic data analysis — graphical and statistical

The team compiles the list, then **prioritises** which X's to explore first and **eliminates obvious low-impact X's**. The X-Y matrix is this prioritisation tool.

From the fishbone, put the **controllable X's** into the X-Y matrix (p. 119). The goal is to separate the **vital few X's** from the **trivial many**. **Procedural and noise X's** go to the **FMEA** instead. Use common sense: not every fishbone item deserves a row.`},{heading:"How to fill it in",body:`Follow the book's steps (pp. 120–121):

1. **List the X's** (inputs) in rows, down the left side.
2. **List the Y's** (outputs) in columns across the top — your **primary metric** and any **secondary metrics**.
3. **Weight each Y** on a scale of **1 to 10** (10 = most important). Ties are fine. New metrics often appear at this point; you may need to add secondary metrics or refine the primary metric.
4. **Score each X against each Y** on the scale **0, 1, 3 or 9**:
   - 9 = strong effect
   - 3 = moderate effect
   - 1 = weak effect
   - 0 = no effect
5. **Calculate the ranking** for each X:
$$\\text{Ranking}_X = \\sum (\\text{score of X on each Y} \\times \\text{weight of that Y})$$
6. **Sort** the X's from highest to lowest ranking.

Why 1-3-9 and not 1-10? With a 1–10 scale the team argues "is it a 6 or a 7?". The wide gaps make the strong X's stand out.`},{heading:"Worked example",body:`A call centre has two Y's: **customer wait time** (weight 10) and **first-call resolution** (weight 6). Three X's are scored:

| X | Wait time (w = 10) | Resolution (w = 6) | Ranking |
|---|---|---|---|
| Staffing level | 9 | 3 | 9×10 + 3×6 = **108** |
| Agent training | 3 | 9 | 3×10 + 9×6 = **84** |
| Office lighting | 1 | 1 | 1×10 + 1×6 = **16** |

Total of rankings = 108 + 84 + 16 = 208. The **rank %** of staffing level is:
$$\\text{Rank \\%} = \\dfrac{108}{208} \\times 100 = 51.9\\%$$

Decision: study **staffing level** and **training** first; drop lighting as an obvious low-impact X.

In the book's laminating example, **temperature** scored the highest ranking (**162, 14.90%**), followed by human handling (159) and material properties (130) (p. 122).`},{heading:"How to use the result",body:`- **Focus data collection** on the top-ranked X's. The book says to put your graphing and data work on "the top X's from the X-Y diagram" (p. 159).
- The X-Y matrix and the process map feed the **FMEA** (exercise, p. 136), and the level-3 spreadsheet output can be fed directly into a C&E matrix and an FMEA (p. 116).
- In the Measure roadmap, the X-Y matrix and FMEA are used to **"Select the Vital Few X's Causing Problems"** (p. 230).
- The **Analyze** phase then tests the top X's with data. Expect some surprises.
- Keep the matrix **alive**: update it when a metric, weight or X changes.

Measure deliverables include a completed X-Y matrix, and the checklist asks **who participated** (p. 231). A matrix filled in by one person or by managers' best guesses is a known roadblock (p. 229).`}],keyPoints:["X-Y matrix = team-based prioritisation tool for potential X's against multiple Y's.",'It is based on team opinion — "not real data".',"Created for every project, never completed, updated whenever a parameter changes.","Y weights: 1–10 (10 = most important). X scores: 0, 1, 3, 9.","Ranking of an X = sum of (score × weight) across all Y's.","Controllable X's from the fishbone go in; procedural and noise X's go to the FMEA.","Purpose: separate the vital few X's from the trivial many."],examTips:["Expect a small calculation: multiply each score by its Y weight and add across the row.","Trap: the X-Y matrix does not prove causation; it only prioritises for data collection.","Know the scales: weights 1–10, correlation scores 0/1/3/9 — mixing them up gives wrong answers.","If asked what happens after the X-Y matrix, the answer is usually the FMEA and data collection on the top X's."]},{topic:"2.1.4",title:"Failure Modes & Effects Analysis (FMEA)",pages:"Book pp. 123–136",doc:"book-101-200",pdfPage:26,intro:"**FMEA** is a structured, team-based way to find how a process can fail, how bad each failure would be, how often it may happen and how well we would catch it. Each failure gets a **Risk Priority Number (RPN)** so the team knows which risks to act on first. It is a living document that is updated through the whole project.",sections:[{heading:"Definition and purpose",body:`FMEA (say the letters F-M-E-A) is a structured approach to (p. 123):

- **Predict failures** and prevent them from happening
- **Identify the ways** a process can fail to meet critical customer requirements (Y)
- **Estimate Severity, Occurrence and Detection (SOD)** of defects
- **Evaluate the current control plan**
- **Prioritise actions** using the **Risk Priority Number (RPN)**

Key ideas from the book:
- In Measure, the FMEA is built with **tribal knowledge** by a **cross-functional team**. Later, process data improves the occurrence and detection estimates.
- The FMEA **controls X's; it does not eliminate them**. It identifies potential X's and the order to evaluate them.
- FMEAs focus on **continuous problem prevention, not problem solving** (p. 125). They manage **risk** by classifying inputs and monitoring their effects (p. 126).`},{heading:"History, types and timing",body:`**History** (p. 124): first used in the **1960s for the Apollo missions**; the US Navy issued **MIL-STD-1629** in 1974; the car industry adopted it in the late 1970s; the **AIAG** now maintains the standard for design and process FMEAs.

**Types:**
- **System FMEA** — early concept level, where modules tie together (e.g., a car's electrical system).
- **Design FMEA (DFMEA)** — analyses product failure modes before release. Its **severity rating must be carried into the PFMEA**.
- **Process FMEA (PFMEA)** — failure modes in manufacturing **and transactional** processes that may escape to the customer.
- **Equipment FMEA** — failure modes of the equipment that makes or tests the product.

**Who and when** (p. 125): the project team plus anyone who defines, runs or changes the process. A PFMEA starts at the **conceptual design** stage and is **updated** when a design or process changes, when carry-over designs are used in new settings, and when a problem-solving study is completed. That is why it is called a **living document**.`},{heading:"The FMEA columns in order",body:`The template, left to right (pp. 127–135):

| Column | What goes in it | Main source |
|---|---|---|
| # and process step | Steps in the same order as the process map | Process map |
| Potential failure mode | How the step can fail — "a fancy name for a defect" | Historical defect data |
| Potential failure effect | Effect on the outputs of the step | Process map |
| **SEV** | Severity of the effect (1–10) | Team + standard scale |
| Class | C, P or N | Fishbone / process map |
| Potential causes (X's) | How the failure could occur | Fishbone |
| **OCC** | How often the cause is expected (1–10) | Capability studies, defect history |
| Current controls | SPC, poka-yoke (mistake proofing), inspection | — |
| **DET** | Chance the control will catch the failure (1–10) | MSA studies, process map |
| **RPN** | $SEV \\times OCC \\times DET$ | Calculated |
| Actions, owner, date, actions taken | Prevention plan | Team |
| New SEV, OCC, DET, RPN | Re-scored after actions | Team |`},{heading:"The rating scales (1 to 10)",body:`All three ratings use a **1–10 scale**, and the team must use its scale **consistently**.

**Severity** — impact of the failure on the business or customer. AIAG (car industry) scale: **10 = hazardous without warning**, 9 = hazardous with warning, 8 = very high (100% scrap, primary function lost) … **1 = no effect**. The book also gives a **transactional** scale (10 = may endanger the company's ability to do business). You may define your own scale; consistency matters more than the exact words (p. 130).

**Occurrence** — likelihood of the cause (AIAG, p. 132): **10 = 1 in 2 or more** (Cpk < 0.33); 5 = 1 in 400 (Cpk ≥ 1.00); 3 = 1 in 15,000 (Cpk ≥ 1.33); **1 = 1 in 1,500,000 or fewer** (Cpk ≥ 1.67).

**Detection** — chance the control catches the defect before it moves on (p. 134): **10 = almost impossible** (detects < 80%); 5 = moderate (90%); **1 = almost certain** (99.5%).

Careful: for detection, a **high number means poor detection**.`},{heading:"Calculating and using the RPN",body:`$$RPN = SEV \\times OCC \\times DET$$

Each factor is 1–10, so the RPN runs from **1 to 1,000**.

**Worked example** (pizza order taking):

| Failure mode | SEV | OCC | DET | RPN |
|---|---|---|---|---|
| Wrong address written | 7 | 5 | 6 | **210** |
| Wrong price quoted | 4 | 6 | 3 | **72** |
| Order lost before reaching cook | 9 | 2 | 3 | **54** |

Rank by RPN: the address problem is first. The team adds a **mistake-proofing** step (the system checks the address against the phone number). Re-score: OCC falls to 3 and DET to 2. New RPN:
$$7 \\times 3 \\times 2 = 42$$

**How to decide:**
- Work from the highest RPN down (a Pareto of risk).
- Also act on any failure with **very high severity (9–10)**, even if its RPN is low.
- Actions normally reduce **occurrence** (prevention) or improve **detection**. **Severity usually stays the same** unless the design changes.`}],keyPoints:["FMEA = structured approach to predict failures and prioritise actions using RPN.","RPN = Severity × Occurrence × Detection; each 1–10, so RPN is 1–1,000.","Failure mode = defect; effect = what the customer or next step feels; cause = the X.","Severity 10 = hazardous; Occurrence 10 = very frequent; Detection 10 = almost impossible to detect.","Failure modes come from defect history, effects from the process map, causes from the fishbone.","Current controls: SPC, poka-yoke (mistake proofing), inspection.","FMEA controls X's rather than eliminating them; it is a living document re-scored after actions.","DFMEA severity must be carried into the PFMEA."],examTips:["Expect an RPN calculation and a ranking question; remember to multiply, not add.","Trap: a detection score of 1 is the best (almost certain detection), not the worst.","Improving controls lowers DET; preventing causes lowers OCC; severity rarely changes.","Two failures can have the same RPN but very different risk — the exam may expect high severity to be addressed first.","Know the order of creation: process map → fishbone → X-Y matrix → FMEA."]},{topic:"2.2.1",title:"Basic Statistics",pages:"Book pp. 139–146",doc:"book-101-200",pdfPage:42,intro:'**Basic statistics** is the language a process uses to "speak" to us through data. It covers the difference between a population and a sample, the types of data and the scales of measurement. Choosing the right data type decides which graphs and tests you can use later.',sections:[{heading:"Why statistics matters in Six Sigma",body:`The purpose of basic statistics is to (p. 139):

- Give a **numerical summary** of the data
- Provide the **basis for inferences** about the future
- Provide the **foundation for assessing process capability**
- Give a **common language** across the organisation to describe processes

The book uses an image: data is like **crude oil**. Crude oil is not very useful, but refined it becomes fuel, medicine and food products. Statistics **refines data** into information and knowledge for decisions.

Six Sigma does **not** try to turn people into statisticians. It makes them **excellent problem solvers** who use the right statistical techniques (p. 140). The goal is to decide based on **data**, not on "I think", "I feel" or "in my opinion" (p. 142).`},{heading:"Population, frame and sample",body:`Three terms (p. 141):

- **Population** — all the items that have the property of interest. Define it carefully, e.g., "all trades completed in 2001".
- **Frame** — an identifiable list or subset that represents the population; the source the sample is drawn from. Example: a list of licensed drivers may represent the adult public better than a list of registered voters.
- **Sample** — a much smaller subset of the population used to make an **inference**.

**Parameters vs statistics:**

| Describes | Name | Symbols |
|---|---|---|
| Population | **Parameter** | $\\mu$, $\\sigma$, $\\sigma^2$, $P$, $N$ |
| Sample | **Statistic** | $\\bar{x}$, $s$, $s^2$, $p$, $n$ |

**Why sample?** To get a sufficiently accurate inference for **much less time, money and resources**. If sampling is done well, what we see in the sample represents the population. Most of the time we work with **sample formulas**.`},{heading:"Types of data",body:`The first step in refining data is to know what **type** it is (pp. 142–143).

| Type | Description | Examples |
|---|---|---|
| **Attribute** (qualitative) | Binary: only two values | Yes/No, Go/No-go, Pass/Fail |
| **Discrete** (count) | Whole-number counts; cannot be meaningfully split | Number of defects, defective units, customer returns |
| **Continuous** (quantitative) | Measured on a scale; decimals are meaningful | Time, money, pressure, conveyor speed, feed rate |

**Quick test:** can the value be meaningfully subdivided? "2.543 inches" makes sense; "2.543 defects" does not.

**Book vs exam convention:** the book separates binary *attribute* data from *discrete count* data and calls attribute "the lowest level of data". Most exam questions and Minitab menus use **"attribute" or "discrete"** for both counts and categories, against **"continuous" (variable)**. On the exam, ask: is it **measured on a continuous scale**, or **counted / classified**?`},{heading:"Scales of measurement",body:`The scale decides which statistics and tests are allowed (pp. 144–146).

| Scale | What you can do | Book examples |
|---|---|---|
| **Nominal** | Names or labels only; no order; only "same or different" | Blood type (A, B, AB, O), state of residence, country of birth |
| **Ordinal** | Ordered, but differences have no exact meaning | Car size (subcompact … luxury), rating (poor, good, excellent) |
| **Interval** | Ordered and differences are meaningful; **no true zero** | IQ scores — 120 is not "1.2 times" 100 |
| **Ratio** | All arithmetic, including division; **true zero** = none of the characteristic | Grams of fat eaten — 50 g is twice 25 g, 0 g means none |

Memory aid: **NOIR** — Nominal, Ordinal, Interval, Ratio, from least to most information.

Temperature in °C is a classic interval example: 20°C is not "twice as hot" as 10°C, because 0°C is not "no heat".`},{heading:"Convert attribute data to continuous where you can",body:`**Continuous data is always more desirable** (p. 146). It shows *how far* each unit is from the target, needs smaller samples and allows more powerful tools. Attribute data can often be turned into continuous data by expressing it as a **rate** or a **measured amount**.

The book's examples — which is more useful?

- 15 scratches, or **total scratch length of 9.25**
- 22 foreign materials, or **2.5 foreign materials per square inch**
- 200 defects, or **25 defects per hour**

**Worked example.** A team counted 200 defects during an 8-hour shift. As a rate:
$$\\text{Defect rate} = \\dfrac{200 \\text{ defects}}{8 \\text{ hours}} = 25 \\text{ defects per hour}$$

Now the team can compare shifts of different lengths, plot the rate over time and use tools for continuous data. In a service process, "number of late tickets" can become "minutes late per ticket".`}],keyPoints:["Population parameters use Greek letters (μ, σ, N); sample statistics use Latin letters (x̄, s, n).","A frame is the list a sample is drawn from; a sample is used to make an inference about the population.","Continuous data can be meaningfully subdivided; discrete/attribute data are counts or categories.","Scales from least to most information: Nominal, Ordinal, Interval, Ratio (NOIR).","Only ratio data has a true zero.","Continuous data is preferred; convert counts to rates when possible.","Six Sigma makes people problem solvers, not statisticians."],examTips:['Classic question: is "time to resolve a ticket" continuous? Yes. Is "number of tickets" continuous? No — it is discrete.',"Survey ratings such as 1–5 satisfaction are ordinal, not interval or ratio.","Watch the symbols: s and x̄ are sample statistics; σ and μ are population parameters.","Trap: a percentage or rate based on counts (e.g., % defective) is still built from discrete data, but a measured amount (scratch length) is continuous."]},{topic:"2.2.2",title:"Descriptive Statistics",pages:"Book pp. 147–151",doc:"book-101-200",pdfPage:50,intro:'**Descriptive statistics** summarise a data set with a few numbers: where its **centre** is (mean, median, mode) and how much it **spreads** (range, interquartile range, standard deviation, variance). They are the "Basic Statistics on Y" that every Measure phase must report.',sections:[{heading:"Two families of measures",body:`The book groups the common descriptive statistics into two families (p. 147):

| Measures of **location** (central tendency) | Measures of **variation** (dispersion) |
|---|---|
| Mean | Range |
| Median | Interquartile range (IQR) |
| Mode | Standard deviation |
| (Trimmed mean) | Variance |

For each family, ask: how alike or different are the measures, and what does that tell us? For example, if the mean is much larger than the median, a few large values are pulling the mean up — the data are **skewed**.

In Minitab: *Stat > Basic Statistics > Display Descriptive Statistics*. The book's output for 200 values shows N = 200, Mean = 4.9999, SE Mean = 0.000712, StDev = 0.0101, Min = 4.97, Q1 = 4.99, Median = 5.00, Q3 = 5.01, Max = 5.02.`},{heading:"Measures of location",body:`**Mean** — the arithmetic average and the **balance point** of the data (p. 148).
$$\\bar{x} = \\dfrac{\\sum x_i}{n} \\qquad \\mu = \\dfrac{\\sum x_i}{N}$$
The calculation is the same for a sample and a population; only the symbol changes.

**Median** — the **middle value** (50th percentile) after sorting. With an odd number of values it is the single middle value; with an even number it is the average of the two middle values. The median is **not affected by extreme values**. That is why average salary is reported as a median: a few billionaires pull the mean up.

**Trimmed mean** — remove a set percentage of the smallest and largest values, then average the rest. A compromise between mean and median, useful when extreme values are possible (p. 149).

**Mode** — the **most frequent** value. A distribution with two modes is **bimodal**, which often means two different processes are mixed together.`},{heading:"Measures of variation",body:`**Range** = largest − smallest value (p. 150). Small range = little variability. It is fully efficient for a sample of 2, but as data grow the standard deviation is better.

**Interquartile range** = Q3 − Q1 (75th minus 25th percentile): the spread of the middle 50%. Use **range or IQR when the data are skewed**.

**Variance** — the average **squared** deviation from the mean. It is used when sources of variation must be **added up**: **standard deviations cannot be added; variances can**.

**Standard deviation** — the square root of the variance; a "typical distance" from the mean and the **unit of measure** for distances from the mean. Use it when the data are **symmetric** (p. 151).

**Sample vs population formulas:**
$$s = \\sqrt{\\dfrac{\\sum (x_i - \\bar{x})^2}{n - 1}} \\qquad \\sigma = \\sqrt{\\dfrac{\\sum (x_i - \\mu)^2}{N}}$$

Exam convention: for **sample** data always divide by **n − 1**.`},{heading:"Worked example",body:`Five call-handling times (minutes): **4, 6, 5, 9, 6**.

- **Mean:**
$$\\bar{x} = \\dfrac{4 + 6 + 5 + 9 + 6}{5} = \\dfrac{30}{5} = 6$$
- **Median:** sorted 4, 5, 6, 6, 9 → middle value **6**
- **Mode:** **6** (appears twice)
- **Range:** 9 − 4 = **5**

**Deviations from the mean:** −2, 0, −1, 3, 0. **Squares:** 4, 0, 1, 9, 0. **Sum of squares = 14.**

- **Sample variance and SD:**
$$s^2 = \\dfrac{14}{5 - 1} = 3.5 \\qquad s = \\sqrt{3.5} = 1.87$$
- If these five were the **whole population:**
$$\\sigma^2 = \\dfrac{14}{5} = 2.8 \\qquad \\sigma = 1.67$$

**Standard error of the mean** (shown as SE Mean in Minitab):
$$SE_{\\bar{x}} = \\dfrac{s}{\\sqrt{n}} = \\dfrac{1.87}{\\sqrt{5}} = 0.84$$`},{heading:"Adding variation and choosing the right measure",body:`**Variances add; standard deviations do not.** If a task has two independent steps with SD 3 min and SD 4 min, the total SD is:
$$\\sigma_{total} = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5 \\text{ min}$$
not 3 + 4 = 7 min. This rule is the basis of Gage R&R and of short-term vs long-term variation.

**Which measure to report:**

| Data shape | Centre | Spread |
|---|---|---|
| Symmetric (roughly normal) | Mean | Standard deviation |
| Skewed or with outliers | Median | IQR (or range) |

**Short-term vs long-term:** the book warns that a sample is usually taken over a short period, so it may miss variation that builds up over time (p. 151). A sample SD from one day can be smaller than the true long-term SD. This idea returns in process capability.`}],keyPoints:["Location: mean, median, mode (and trimmed mean). Variation: range, IQR, standard deviation, variance.","The median is resistant to extreme values; the mean is not.","Range = max − min; IQR = Q3 − Q1.","Sample variance divides by n − 1; population variance divides by N.","Standard deviation = square root of variance.","Variances add; standard deviations do not.","Use mean + SD for symmetric data, median + IQR for skewed data."],examTips:['Calculator questions: always check whether the question says "sample" (n − 1) or "population" (N).',"Trap: adding two standard deviations directly. Square them, add, then take the square root.","If mean > median, the data are right-skewed (long tail to the right).","Know how to read Minitab output: SE Mean, StDev, Q1, Median, Q3, N*."]},{topic:"2.2.3",title:"Normal Distributions & Normality",pages:"Book pp. 151–158",doc:"book-101-200",pdfPage:54,intro:"The **normal distribution** is the smooth, symmetric bell curve that many statistical tools assume. Using **Z-scores** we can find what fraction of output falls beyond a limit. Before using those tools we must **test for normality**, because many business and service processes are not normal.",sections:[{heading:"What a normal distribution is",body:`The book lists the characteristics of a normal distribution (p. 151):

- **Only random error** is present
- The process is **free of assignable causes**
- The process is **free of drifts and shifts**

The normal curve is **smooth, symmetric and bell-shaped** (p. 152). The **mean, median and mode are equal**, at the centre. Its shape is fully set by **two parameters: the mean and the standard deviation**. Each pair gives a unique curve.

Many natural measurements (heights, weights) are approximately normal, so it is the most useful continuous model — and also "the most commonly used and abused".

The book adds: when data are **non-normal**, there are often **special or obvious causes** that you can find by looking at the process. So non-normal data can be good news for a project.`},{heading:"The standard normal and Z-scores",body:`Any normal distribution can be converted to the **standard normal distribution**, which has $\\mu = 0$ and $\\sigma = 1$ (p. 152). We do this with the **Z-score**:
$$Z = \\dfrac{x - \\mu}{\\sigma}$$

A Z-score tells you **how many standard deviations** a value is from the mean. A value with Z = 2 is two standard deviations above the mean.

The **area under the curve** between two points equals the **proportion** of the distribution between them (p. 153). After converting to Z, look up the area in a **standard normal table**. This step is the core of process capability: the area beyond a specification limit is the expected proportion of defects.`},{heading:"The empirical rule and a worked example",body:`For a normal distribution (pp. 153–154):

| Range | Share of data inside |
|---|---|
| $\\mu \\pm 1\\sigma$ | about **68%** (68.27%) |
| $\\mu \\pm 2\\sigma$ | about **95%** (95.45%) |
| $\\mu \\pm 3\\sigma$ | about **99.7%** (99.73%) |

Beyond 3 standard deviations, the probability becomes very small whatever the shape.

**Worked example** (book p. 222): the mean is 50, the SD is 3 and the upper spec is 54. What proportion is above 54?
$$Z = \\dfrac{54 - 50}{3} = 1.33$$
From the Z table, the area beyond Z = 1.33 is **0.0918**. So about **9.2%** of output is above the spec, or about **91,760 parts per million** (0.09176 × 1,000,000; p. 223).

**Quick check with the empirical rule:** about 5% of data lie outside ±2 SD, half on each side, so about **2.5%** lie above the mean + 2 SD.`},{heading:"Why assess normality",body:`Many processes in nature are normal, but **many business processes are not**, especially service and transactional ones (p. 154).

- **Many statistical tools assume normality** in their calculations (capability indices, some tests, control limits). If the assumption is wrong, the answers are wrong.
- Some metrics **cannot be normal by nature**. Time cannot be negative ("without a flux capacitor"), so cycle times are usually **bounded at zero and skewed right**.
- There is no "good" or "bad" shape. Look at the distribution in relation to the **intent of your project**. Non-normal data contain much information.

So: **always check normality before** using a tool that assumes it — for example, before a capability analysis (p. 221).`},{heading:"How to test normality and decide",body:`The book uses two Minitab tools (p. 155):

1. **Anderson-Darling (AD) test** — a goodness-of-fit test. It compares the actual data with a normal curve of the same mean and SD ("observed minus expected").
2. **Normal probability plot** — normal data fall on a **straight line**. Points that bend away show where the data differ from normal.

**Decision rule** (exam convention):
- $H_0$: the data are normal. $H_a$: the data are not normal.
- **p-value > 0.05 → fail to reject $H_0$** → treat the data as normal. The book says "the data are normal enough for most purposes".
- **p-value ≤ 0.05 → reject $H_0$** → the data are not normal.

Book example: AD = 0.265, **p = 0.684** → fail to reject → normal enough (p. 156).

**Caveats** (pp. 157, 161):
- With **very large samples** the AD test becomes very sensitive; tiny departures give low p-values. Rule of thumb: if N > 100 and the plot looks normal, it probably is.
- **Do not judge normality from a histogram** of a small sample (e.g., 20 points).`},{heading:"If the data are not normal — do not panic",body:`Non-normal data are **common in the transactional world** and are **not a bad thing** (p. 157). They mean you may need to think about the data differently.

What to do in Measure:
1. **Look for special causes.** If the basic structure should be normal but the plot shows otherwise, the data probably contain **special causes** (p. 158). A **bimodal** shape often means two processes, shifts or suppliers are mixed.
2. **Stratify** the data (by shift, location, operator) and look at each group separately.
3. **Go to the process** and see what is happening, rather than fighting with the statistics (p. 221).
4. For capability in Measure, **use observed performance** unless the data are normal. Methods for non-normal capability (transformations, other distributions) come later.

The book's exercise result: distributions A and D were **not normal** (p. 158).`}],keyPoints:["Normal curve: symmetric bell, mean = median = mode, defined by mean and SD.","Z-score — the number of standard deviations from the mean: $$Z = \\dfrac{x - \\mu}{\\sigma}$$","Empirical rule: 68% within ±1σ, 95% within ±2σ, 99.7% within ±3σ.","Area under the curve between two points = proportion of output between them.","Anderson-Darling: p > 0.05 → fail to reject normality; p ≤ 0.05 → not normal.","Normal data lie on a straight line in a normal probability plot.","Many service and time-based processes are not normal; non-normal data often point to special causes."],examTips:['Wording trap: we never "accept" or "prove" normality — we fail to reject the null hypothesis that the data are normal.','The null hypothesis of the AD test is "data are normal" — a low p-value means NOT normal.',"Be ready for a Z calculation followed by a table look-up, then converting to % or PPM.","Large samples make normality tests over-sensitive; small samples make histograms misleading."]},{topic:"2.2.4",title:"Graphical Analysis",pages:"Book pp. 159–169",doc:"book-101-200",pdfPage:62,intro:"Graphs let you **see** patterns in data before you calculate anything: the shape, the centre, the spread, outliers, changes over time and links between variables. The book covers histograms, dot plots, box plots, individual value plots, time series plots and scatter plots. Choosing the right graph for the question is a key Measure skill.",sections:[{heading:"Why we graph and where the data come from",body:`The purpose of graphing is to (p. 159):

- Identify **potential relationships** between variables
- Identify **risk** in meeting the critical needs of the Customer, Business and People
- Give **insight into which X's** may or may not control Y
- Show the results of **passive data collection** — we observe the process without changing it

**Data sources** come from the earlier Measure tools: process map, X-Y matrix, FMEA and fishbone. Focus on the **top X's** from the X-Y diagram. **Stratify** the data by:

1. **Time** — shift, day of week, week of month, season
2. **Location** — facility, region, office
3. **Operator** — training, experience, skill, adherence to procedures

Remember: if the data are questionable, so is the graph. MSA checks the data quality.`},{heading:"Histogram and dot plot",body:`**Histogram** (p. 160): the horizontal axis is divided into **equal intervals** (cells); the height of each bar is the **frequency** (number of values in that cell). It shows the **shape, centring and spread** of the data, and whether it is symmetric or **skewed**.

**Histogram caveat** (p. 161): with **small samples** (about 20 points) a histogram may not look normal even when the process is normal. **Do not decide normality from a histogram alone** — use a normality test.

**Dot plot** (p. 162): each value is a dot. It is a good alternative to the histogram when you want to **see individual values**:
- It reveals **granularity** (values stuck on a few levels) that a histogram hides.
- You can **brush** points to identify them.
- Clusters or isolated points may be **special causes**. Check them against the **logbook**; address special causes separately and exclude them from the baseline analysis.`},{heading:"Box plot and individual value plot",body:`A **box plot** (box-and-whisker plot) summarises shape, spread and centre and **spots outliers** (pp. 162–163).

- **Box** = Q1 to Q3 (the middle 50%); the line inside = **median**.
- **Whiskers** reach the lowest and highest values that are **not outliers**.
- **Outlier** (asterisk) = more than 1.5 × IQR beyond the box:
$$\\text{Upper limit} = Q3 + 1.5(Q3 - Q1) \\qquad \\text{Lower limit} = Q1 - 1.5(Q3 - Q1)$$
- Symmetric data: median near the middle of the box, whiskers of similar length.
- Use **at least 10 observations**. One variable is **categorical**, the other **continuous** — ideal for comparing groups side by side (before/after, operators, sites).

**Worked example:** Q1 = 20 min, Q3 = 30 min, so IQR = 10. Limits = 30 + 15 = **45** and 20 − 15 = **5**. A value of 48 min is an **outlier**.

**Caution:** a box plot can hide a **bimodal** distribution (it may look symmetric). An **individual value plot** shows every point and reveals the problem (p. 166). Do not over-conclude: in the book's set-up example, Shree had outliers, but he may be the expert called for special set-ups (p. 164).`},{heading:"Time series plot",body:`A **time series plot** shows data **in the order they were produced** (p. 167). The book says **every project should provide time series data** to look for:

- **Frequency** — how often something happens
- **Magnitude** — how big the changes are
- **Patterns** — trends, cycles, shifts

Depending on the pattern, some X's can be found to be critical — or eliminated. For example, a wave pattern (the book's "Time 3" data, p. 168) suggests a cyclic X such as shift change or temperature over the day. Ask: **what X would cause this?**

Minitab can add a **Lowess smoother** (Locally Weighted Scatterplot Smoother) to show the underlying curve (p. 169).

A time series plot is also the simplest **stability** check. A control chart is a time series plot **plus a centre line and control limits** (topic 2.4.2).`},{heading:"Scatter plot and choosing the right graph",body:`A **scatter plot** shows the relationship between **two continuous variables** — an X on the horizontal axis and a Y on the vertical axis. It is in the book's list of graphs (p. 159) and is used in detail in Analyze (correlation and regression). A pattern shows **association, not proof of cause**.

**Attribute Y:** if the output is pass/fail and the X is continuous, the book draws a **transposed box plot** with pass/fail on the Y axis (p. 165).

**Which graph for which question?**

| Question | Graph |
|---|---|
| What is the shape, centre and spread? | Histogram (large n), dot plot (small n) |
| Do groups differ? Are there outliers? | Box plot, individual value plot |
| Is the process changing over time? | Time series plot (run chart), control chart |
| Are two continuous variables related? | Scatter plot |
| Which categories cause most defects? | Pareto chart (Define tool) |`}],keyPoints:["Graphs show shape, centre, spread, outliers, time patterns and relationships.","Histogram: equal intervals, bar height = frequency; not reliable for normality with small samples.","Dot plot shows individual values and granularity that a histogram hides.","Box plot: box = Q1 to Q3, line = median; outliers beyond 1.5 × IQR from the box.","Box plots compare groups but can hide bimodal data — check with an individual value plot.","Every project should include a time series plot to look for frequency, magnitude and patterns.","Scatter plot = relationship between two continuous variables (association, not causation)."],examTips:["Know box plot anatomy cold: whiskers, median line, Q1, Q3, outlier rule 1.5 × IQR.",'Questions that mention "over time", "trend" or "shift" point to a time series plot or control chart.',"Comparing several groups (operators, sites, shifts) → box plot.","Trap: a histogram cannot show time order, so it cannot show a trend."]},{topic:"2.3.1",title:"Precision & Accuracy",pages:"Book pp. 172–182",doc:"book-101-200",pdfPage:75,intro:"Before trusting any data, we must know how much of what we see comes from the **measurement system** itself. **Accuracy** asks whether the measurements are right **on average**; **precision** asks whether they **repeat** with little spread. Measurement System Analysis (MSA) checks both.",sections:[{heading:"Why MSA comes first",body:`The book calls MSA **non-negotiable**: it applies to about **98% of projects** and can have a massive effect on success (p. 172). It is a **"show stopper"** (p. 178).

**Measurement error** = the effect of **all** sources of measurement variability that make an observed value differ from the **true value** (p. 172).

The **measurement system** is the whole process used to get a measurement: **procedures, gages and personnel** — plus the item measured, the reference standard and the environment (p. 173). So MSA is **the entire system, not just calibration**.

The observed variation is made of two parts (p. 178):
$$\\sigma^2_{observed} = \\sigma^2_{unit\\text{-}to\\text{-}unit} + \\sigma^2_{measurement}$$

If you do not know how much comes from measurement, you cannot make confident decisions. In the book's experience, **more than 80%** of critical measurement points fail in one way or another (p. 177).`},{heading:"Accuracy",body:`**Accuracy** is the difference between the **observed average** of the measurements and a **reference (true) value** (p. 181). A system that consistently over- or under-estimates is **inaccurate**.

Accuracy describes **location** (the average). Its components are (pp. 173–174):
- **Bias** — offset from the true value
- **Linearity** — change in bias across the operating range
- **Stability** — change in bias over time
- (**Resolution** — how detailed the reading is — is listed with them)

**How to assess accuracy:**
1. Measure a **known standard**
2. Compare with **another known method**
3. Compare with a **theoretical value**

**Transactional example** (p. 181): a database query of product returns should **add up to the figure in the financial reports** (e.g., the income statement) before you analyse the details. If it does not reconcile, the query is not accurate.`},{heading:"Precision: repeatability and reproducibility",body:`**Precision** is the **spread** of repeated measurements, measured by the standard deviation. A precise system returns the same value every time, **no matter who measures or when** (p. 179). Precision splits into two parts:

**Repeatability** — variation when **one appraiser** uses **one instrument** several times on the **same characteristic of the same part**. Also called **equipment variation**.
- Manufacturing: one person measures purity of the same vial several times and gets different results.
- Transactional: one person reviews the same contract on different days and finds different errors.

**Reproducibility** — variation in the **averages** of measurements made by **different appraisers** using the same instrument on the same part (p. 180). Also called **appraiser variation**.
- Manufacturing: different people test samples from the same vial and get different results.
- Transactional: different people review the same contract and make different decisions.

$$\\text{Gage R\\&R} = \\text{Repeatability} + \\text{Reproducibility} \\text{ (as variances)}$$`},{heading:"The target picture",body:`Think of a target. The **bull's-eye** is the true value (pp. 175, 182).

| Picture | Accurate? | Precise? | What it means |
|---|---|---|---|
| Shots spread widely, centred on the bull's-eye | Yes | No | Average right, but large variation |
| Shots tight together, away from the centre | No | Yes | Little variation, but biased |
| Shots tight on the bull's-eye | Yes | Yes | Good measurement system |
| Shots spread and off-centre | No | No | Poor system |

Another way to think: if the measurement results form a distribution, **accuracy is its mean** and **precision is its variance** (p. 181).

The book notes: **most measurement systems are accurate but not precise** (p. 182). A third question is **reproducibility**: can each person achieve the same accuracy and precision as the others (p. 175)?`},{heading:"Worked example and how to act",body:`A reference block is exactly **10.00 mm**. Two gages each measure it 20 times:

| Gage | Average | Standard deviation | Bias |
|---|---|---|---|
| A | 10.00 mm | 0.20 mm | 0.00 |
| B | 10.30 mm | 0.02 mm | +0.30 mm |

- **Gage A** is **accurate but not precise**. Its average is right, but single readings can be far off. Action: better gage, better method, or average several readings.
- **Gage B** is **precise but not accurate**. It repeats well but reads 0.30 mm high. Action: **calibrate** to remove the bias.

Bias is usually easier to fix (an offset) than poor precision.

**Resolution check:** if repeated readings are **always exactly the same**, this is a warning sign — the gage may not have enough resolution to see variation. The book asks: would you use a football field to measure a spark plug gap (p. 179)?`}],keyPoints:["MSA is non-negotiable: check the measurement system before analysing the data.","Measurement system = procedures, gages, personnel, item, reference and environment — not just calibration.","Accuracy = observed average minus reference value (location); precision = spread (SD).","Accuracy components: bias, linearity, stability. Precision components: repeatability, reproducibility.","Repeatability = same person, same gage, same part, repeated (equipment variation).","Reproducibility = difference between appraisers' averages (appraiser variation).","Observed variance = true part variance + measurement variance."],examTips:["Target pictures are common: tight off-centre = precise not accurate; wide centred = accurate not precise.","Trap: repeatability is within one appraiser; reproducibility is between appraisers. Do not swap them.","Calibration fixes bias (accuracy), not repeatability (precision).",'MSA must be done before capability, hypothesis tests or DOE — "before you analyse, check the gage".']},{topic:"2.3.2",title:"Bias, Linearity & Stability",pages:"Book pp. 173–174, 181–183",doc:"book-101-200",pdfPage:76,intro:"**Bias, linearity and stability** are the three parts of **accuracy**. Bias is a fixed offset from the truth, linearity is bias that changes across the measuring range, and stability is bias that changes over time. All three move the **location** of the measurements, not their spread.",sections:[{heading:"Location errors",body:`The book separates measurement errors that affect **location** (the average) from those that affect **spread** (p. 173):

| Affects location (accuracy) | Affects spread (precision) |
|---|---|
| **Bias** | Repeatability |
| **Linearity** | Reproducibility |
| **Stability** | |

- **Bias** — offset of the average from the true value.
- **Linearity** — **change in accuracy through the expected operating range** of the instrument.
- **Stability** — **lack of consistency** in the measurement **over time**.

To estimate any of them you must take **multiple measurements of a single characteristic** and compare them with a **reference value** (a master or standard).`},{heading:"Bias",body:`**Bias** is the deviation of the measured value from the actual (reference) value (p. 182):
$$\\text{Bias} = \\bar{x}_{measured} - \\text{Reference value}$$

- **Constant bias:** the measurement is off by the **same amount** everywhere. The book's example: a scale that reads **3 lb with nothing on it** has a 3 lb bias.
- **Variable bias:** the amount of bias **changes with the setting level** — typical of electronic equipment (p. 174). This is a linearity problem.

**Calibration** procedures can **minimise and control bias** within acceptable limits. But bias can **never be fully eliminated**, because of material wear and tear.

**Worked example:** a 50.0 g standard weight is measured 10 times; the average is 50.4 g.
$$\\text{Bias} = 50.4 - 50.0 = +0.4 \\text{ g}$$
If the tolerance width is 8 g, the bias uses
$$\\dfrac{0.4}{8} \\times 100 = 5\\%$$
of the tolerance.`},{heading:"Linearity",body:`**Linearity** is the **difference in bias values across the measurement range** in which the gage is used (p. 183). It answers: *does my gage have the same accuracy for small, medium and large items?*

**Method:** measure reference parts at the **low, nominal and high** end of the range. Plot **bias (y)** against **reference value (x)** and fit a straight line. A flat line (slope 0) means good linearity.

The book's formulas:
$$\\text{Linearity} = |\\text{Slope}| \\times \\text{Process Variation} \\qquad \\%\\text{Linearity} = |\\text{Slope}| \\times 100$$

**Worked example:** at a reference of 2 mm the bias is +0.02 mm; at 10 mm it is −0.06 mm.
$$\\text{Slope} = \\dfrac{-0.06 - 0.02}{10 - 2} = \\dfrac{-0.08}{8} = -0.01$$
So %Linearity = 0.01 × 100 = **1%**. If the process variation is 6 mm, Linearity = 0.01 × 6 = **0.06 mm**.

Poor linearity often means the instrument needs **maintenance or replacement** (p. 183).`},{heading:"Stability",body:`**Stability** looks for **changes in accuracy (bias) over time** — **drift** (p. 183). The book defines gage stability as **error as a function of time**: "stability is bias characterised as a function of time".

**Causes:** environmental conditions such as cleanliness, noise, vibration, lighting, chemicals, and **wear and tear**.

**How to study it:**
- Measure the **same master part** at regular intervals (e.g., each day or shift).
- Plot the results on a **control chart**. Control charts are the common tool to track measurement stability over time.
- A **gage stability study should be the first exercise after calibration**.

Good maintenance gives a high degree of stability, but the book says the issue **can never be fully eliminated** — unlike reproducibility, which training and standard methods can remove.

**Example:** a call-timing system is checked each morning against a 60-second test call. Over three weeks the readings creep from 60.0 s to 61.5 s. This is a **stability (drift)** problem; the clock source needs correction and periodic checks.`},{heading:"Deciding what to do",body:`Use the type of problem to choose the action:

| Finding | Meaning | Typical action |
|---|---|---|
| Same offset at all sizes | Constant **bias** | Calibrate / zero the gage |
| Offset grows or shrinks across the range | **Linearity** problem | Maintenance, repair or replace; calibrate across the range |
| Offset changes over days or weeks | **Stability** (drift) problem | Control environment, schedule recalibration, chart a master part |

**Order of work in a Gage R&R study** (p. 192): Step 4 says **calibrate the gage** before the study and "remember **linearity, stability and bias**". Accuracy issues are dealt with first; then repeatability and reproducibility are measured.

Remember that a poor gage can also make your process look **worse or better** than it really is. Bias, linearity and stability problems can lead your customer to wrong conclusions about your product (p. 176).`}],keyPoints:["Bias, linearity and stability are accuracy (location) errors.","Bias = measured average − reference value.","Constant bias: same offset everywhere (e.g., scale reads 3 lb when empty).","Linearity = change in bias across the operating range; %Linearity = |slope| × 100.","Stability = change in bias over time (drift); tracked with control charts.","Calibration controls bias but cannot remove it completely (wear and tear).","A gage stability study should be the first exercise after calibration."],examTips:['Keyword match: "across the range" = linearity; "over time" = stability; "offset from the true value" = bias.',"Trap: stability here means the measurement system over time, not the process (process stability is 2.4.2).","Linearity questions may give bias at two reference values — compute the slope.","None of these three affect precision; repeatability and reproducibility do."]},{topic:"2.3.3",title:"Gage Repeatability & Reproducibility",pages:"Book pp. 176–198",doc:"book-101-200",pdfPage:79,intro:"A **Gage R&R study** measures how much of the observed variation comes from the measurement system (**repeatability + reproducibility**) and how much comes from **real differences between parts**. Several operators measure the same parts several times, and Minitab splits the variation into components. The result tells you whether the data can be trusted.",sections:[{heading:"What Gage R&R measures",body:`The components of variation are **statistically additive** (as variances; p. 176):
$$\\sigma^2_{total} = \\sigma^2_{part\\text{-}to\\text{-}part} + \\sigma^2_{R\\&R}$$
$$\\sigma^2_{R\\&R} = \\sigma^2_{repeatability} + \\sigma^2_{reproducibility}$$
$$\\sigma^2_{reproducibility} = \\sigma^2_{operator} + \\sigma^2_{operator \\times part}$$

Minitab uses the **ANOVA method** with a **random effects model** and gives a column of **variance components (VarComp)** (p. 184). Repeatability, operator and operator×part are added to get the total measurement-system variation.

**Uses of MSA** (pp. 176–177): compare operators, compare gages, accept new equipment, evaluate a suspect gage or a gage after repair, find the **true process variation**, and test training effectiveness.

In a good system the **largest component is part-to-part** variation (p. 187).`},{heading:"Planning the study",body:`The most common design is the **crossed 10 × 3 × 2**: **10 parts**, each measured by **3 operators**, **2 times** = **60 measurements** (p. 193). A minimum of two measurements per part per operator is needed; **three is better**.

**Steps** (p. 192):
1. Team meeting to explain the Gage R&R.
2. **Select parts across the range of interest** — not random. Do **not** include grossly defective parts (the engine block with a fist-sized hole would distort the result).
3. Choose inspectors; tell them the **system is being evaluated, not the people**.
4. **Calibrate** the gage (remember linearity, stability, bias).
5–6. Each inspector measures all parts once, in **random order**.
7. Repeat for the next trial, with a **delay** between trials.
8. Analyse in Minitab (*Stat > Quality Tools > Gage Study > Gage R&R Study (Crossed)*).
9. Draw conclusions and act.

A **blind study** is strongly preferred: ideally the operator does not know it is a test; at least they should not know which part they are measuring (p. 192).`},{heading:"The four key metrics",body:`**%Contribution** — share of total **variance** (p. 185):
$$\\%\\text{Contribution} = \\dfrac{\\text{VarComp}_{source}}{\\text{VarComp}_{total}} \\times 100$$

**%Study Variation** — share of total **standard deviation** (Study Var = 6 × SD in current Minitab; the book's older note says 5.15 × SD):
$$\\%\\text{Study Var} = \\dfrac{SD_{R\\&R}}{SD_{total}} \\times 100$$

**%Tolerance** — share of the **specification width** used by measurement error:
$$\\%\\text{Tolerance} = \\dfrac{6 \\times SD_{R\\&R}}{USL - LSL} \\times 100$$

**Number of distinct categories (ndc)** — how many groups of parts the system can tell apart (always **round down**):
$$ndc = 1.41 \\times \\dfrac{SD_{part}}{SD_{R\\&R}}$$

Note: %Study Var values **do not add up to 100%** (SDs do not add); %Contribution values do.`},{heading:"Acceptance criteria",body:`**Exam convention** (AIAG, used by most exam questions):

| %Study Var or %Tolerance | %Contribution | Verdict |
|---|---|---|
| **< 10%** | < 1% | **Acceptable** |
| **10% – 30%** | 1% – 9% | **Marginal** — may be accepted depending on importance and cost |
| **> 30%** | > 9% | **Unacceptable** — fix the measurement system |

**ndc ≥ 5** is recommended. With 1 category the system only tells good from bad; 2–4 categories give only coarse estimates (p. 186).

**Book's table** (p. 186) uses four bands: ≤10% ideal, 10–20% acceptable, 20–30% marginal, ≥30% poor (and ≤1%, 1–4%, 5–9%, ≥10% for %Contribution). It agrees with the exam at the 10% and 30% boundaries; use the three-band exam convention when answering.

Use **%Study Var** to compare measurement error with **process variation**; use **%Tolerance** to compare it with the **customer specification** (p. 185).`},{heading:"Worked example: the book's Minitab output",body:`Book session window (p. 196), tolerance = 1.0:

| Source | VarComp | SD |
|---|---|---|
| Total Gage R&R | 0.0010458 | 0.032339 |
| Repeatability | 0.0007600 | 0.027568 |
| Reproducibility | 0.0002858 | 0.016907 |
| Part-to-part | 0.0349273 | 0.186889 |
| Total | 0.0359731 | 0.189666 |

$$\\%\\text{Contribution} = \\dfrac{0.0010458}{0.0359731} \\times 100 = 2.91\\%$$
$$\\%\\text{Study Var} = \\dfrac{0.032339}{0.189666} \\times 100 = 17.05\\%$$
$$\\%\\text{Tolerance} = \\dfrac{6 \\times 0.032339}{1.0} \\times 100 = 19.40\\%$$
$$ndc = 1.41 \\times \\dfrac{0.186889}{0.032339} = 8.15 \\rightarrow 8$$

**Decision:** the book calls this gage acceptable. Under the exam's three bands, 17% is **marginal** (usable with caution); ndc = 8 is good. Repeatability (14.54% study var) is larger than reproducibility (8.91%), so improvement should focus on the **equipment** rather than the operators.`},{heading:"Reading the graphs and fixing problems",body:`**Minitab graphs** (pp. 187–189, 195):
- **Components of variation:** part-to-part bars should be **much taller** than Gage R&R bars.
- **R chart by operator:** should be **in control**. A point above the UCL means that operator measured a part inconsistently.
- **Xbar chart by operator:** should be mostly **out of control** — the parts were chosen to differ, so their averages must fall outside the narrow limits.
- **Operator × part interaction:** lines should be **parallel and close**. Crossing lines mean an operator's result depends on the part.
- **By operator:** the line joining operator averages should be **flat**.

**Fixes** (p. 190): repeatability problem for all operators → **repair, calibrate or replace the gage**; for one operator → **retrain** that person. Reproducibility problem → training, standard method, check fixtures.

**Signal averaging** (temporary fix, pp. 197–198): average n repeated readings. The book's case: repeatability is 35% of tolerance; the target is 15%.
$$n = \\left(\\dfrac{35}{15}\\right)^2 = 5.44 \\rightarrow 6 \\text{ readings}$$
With SD 9.5 for one reading:
$$SD_{average} = \\dfrac{9.5}{\\sqrt{6}} = 3.88$$`}],keyPoints:["Total variance = part-to-part + Gage R&R; Gage R&R = repeatability + reproducibility.","Classic design: 10 parts × 3 operators × 2–3 trials, crossed, blind, random order.","Choose parts across the full process range — not random, no gross defects.","%Contribution uses variances (adds to 100%); %Study Var uses SDs (does not add to 100%).","Exam bands: <10% acceptable, 10–30% marginal, >30% unacceptable.","ndc ≥ 5 recommended (round down): $$ndc = 1.41 \\times \\dfrac{SD_{part}}{SD_{R\\&R}}$$","Good system: part-to-part is the largest component; Xbar chart by operator mostly out of control.","Repeatability problem → fix the gage; reproducibility problem → train operators / standardise method."],examTips:["Know the 10/30 rule for %Study Var and %Tolerance, and the 1/9 rule for %Contribution.","Trap: an in-control Xbar chart in a Gage R&R is bad news — the gage cannot see part differences.","If one operator's R chart is out of control, the problem is that operator's repeatability (training/technique).","Questions may give VarComp values: %Contribution uses them directly; %Study Var needs their square roots.","Destructive tests cannot use a crossed design — see nested designs in 2.3.4."]},{topic:"2.3.4",title:"Variable & Attribute MSA",pages:"Book pp. 184–204",doc:"book-101-200",pdfPage:87,intro:"MSA comes in two forms. **Variable MSA** (Gage R&R) is used when the measurement is a continuous number. **Attribute MSA** (attribute agreement analysis) is used when people classify items — pass/fail, type of call, reason code — and checks whether they agree with themselves, with each other and with the correct answer.",sections:[{heading:"Two types of MSA",body:`MSAs fall into two categories (p. 184):

| Attribute MSA | Variable MSA |
|---|---|
| Pass/fail, go/no-go | Continuous scale |
| Document preparation | Critical dimensions |
| Surface imperfections | Pull strength |
| Customer service response | Warp |

- **Variable data is always preferred** — it gives more information.
- **Transactional projects** usually have **attribute** measurement systems.
- **Manufacturing** projects use variable studies more often, and attribute studies less.

Variable MSA is analysed with variance components (Gage R&R, topic 2.3.3). Attribute MSA is analysed by counting **correct and agreeing answers** and with **kappa**.`},{heading:"Variable MSA: crossed vs nested designs",body:`**Crossed design** (p. 191) — used only for **non-destructive** testing: **every operator measures every part** several times.
- Separates part-to-part variation from measurement variation.
- Gives repeatability, reproducibility **and the operator × part interaction**.
- The "workhorse" of MSA. Chemical or biological samples can use it if they come from a homogeneous solution.

**Nested design** — used for **destructive testing** (e.g., crash tests) and when operators **cannot** all measure all parts (e.g., parts cannot travel to other sites).
- **Each part is measured by only one operator.**
- Assumes all parts **within one batch are identical** enough to count as the same part. If not, part variation within the batch hides measurement variation.
- Does not include all combinations of factors; uses a slightly different model.

**Rule:** whenever operators measure **unique parts**, you have a **nested** design. If all operators measure parts from every batch, use crossed.`},{heading:"Attribute MSA: purpose and set-up",body:`An **attribute MSA** tests how well operators use an **operational definition** to categorise items (p. 199). Typical set-up: **3 operators** each categorise the **same 50 samples**, then repeat at least once.

**Rules:**
- Use it when a **continuous measure cannot be obtained**.
- Needs at least **5 times as many samples** as a continuous study.
- The test should be **blind**: randomise the samples; operators must not know the true category.
- Each sample needs a **known standard** (the correct answer), set before the study.
- Use **disagreements to clarify the operational definitions**.

**Purposes** (p. 199): check that all inspectors use the **same criteria**; compare standards with the **customer's requirements**; see how well inspectors agree **with themselves**; compare inspectors with a **known master** — how often they ship defective items and reject good ones; find where **training, procedures or standards** are missing.

The book's visual test: count the F's in a paragraph — the right answer is **36**, and most people miss some (p. 200). Visual inspection is less reliable than people think.`},{heading:"Reading attribute agreement results",body:`Minitab: *Stat > Quality Tools > Attribute Agreement Analysis* (p. 201). Four views:

1. **Within appraiser** — does each person agree with **themselves** across trials?
2. **Each appraiser vs standard** — is each person **correct**?
3. **Between appraisers** — do all people agree **with each other**?
4. **All appraisers vs standard** — do all people agree with each other **and** with the standard?

Book example (15 samples, p. 202):

| Appraiser | Matched | Percent | 95% CI |
|---|---|---|---|
| Duncan | 8 | 53.33% | 26.6 – 78.7% |
| Hayes | 13 | 86.67% | 59.5 – 98.3% |
| Holmes | 15 | 100% | 81.9 – 100% |
| All vs standard | 6 | 40.00% | 16.3 – 67.7% |

$$\\%\\text{Agreement} = \\dfrac{\\text{matched}}{\\text{inspected}} \\times 100 = \\dfrac{8}{15} \\times 100 = 53.3\\%$$

The book says "all appraisers vs standard" should be **above 75%**; many organisations target **90% or more**. Here 40% is far too low. Wide confidence intervals → **add more samples**.`},{heading:"Kappa and deciding what to do",body:`**Kappa** measures agreement **beyond chance** for nominal or ordinal ratings (p. 203):
$$\\kappa = \\dfrac{P_{observed} - P_{chance}}{1 - P_{chance}}$$
- **κ = 1:** perfect agreement
- **κ = 0:** no better than chance
- **κ < 0:** worse than chance (rare)
- **κ ≥ 0.70 is typically required; κ near 0.90 is preferred.**

**Worked example:** two inspectors agree on 90% of items; chance agreement is 50%.
$$\\kappa = \\dfrac{0.90 - 0.50}{1 - 0.50} = \\dfrac{0.40}{0.50} = 0.80$$
This passes the 0.70 level. In the book, Duncan's kappa for the "−2" rating is **0.58**, so he needs help on that category; all of Simpson's kappas exceed 0.70.

**Diagnosis** (p. 202):
- Agree with themselves but not each other or the standard → **training on the standard**.
- Only some disagree with the standard → **targeted training**.
- Be careful who is chosen as the standard — if the standard is wrong, everyone looks wrong.

**Improving visual inspection** (p. 200): training and certification, visual aids and **boundary samples**, clear standards, set-up and evaluation procedures (same location on each part, same lighting, same standard).`}],keyPoints:["Variable MSA for continuous data (Gage R&R); attribute MSA for classifications (agreement analysis).","Variable data is preferred; transactional projects usually need attribute MSA.","Crossed design: every operator measures every part (non-destructive).","Nested design: each part measured by one operator — required for destructive tests.","Attribute MSA needs a known standard, blind random samples, and about 5× the samples of a variable study.","Four agreement views: within appraiser, each vs standard, between appraisers, all vs standard.","Kappa: 1 = perfect, 0 = chance; ≥ 0.70 required, about 0.90 preferred."],examTips:["Destructive testing (crash test, burst test) → nested Gage R&R. This is a favourite question.","Trap: high within-appraiser agreement does not mean the appraiser is correct — check vs standard.",'Know the kappa scale and that 0 means "no better than chance", not "no agreement at all".',"If appraisers agree with themselves but not with each other, the fix is a clearer standard/operational definition and training."]},{topic:"2.4.1",title:"Capability Analysis",pages:"Book pp. 207–221",doc:"book-201-300",pdfPage:10,intro:"**Process capability** compares the **voice of the process** (its spread and centre) with the **voice of the customer** (the specification limits). The indices **Cp, Cpk, Pp and Ppk** tell you whether the problem is centring, variation or both, and they give the **baseline** that the project must improve.",sections:[{heading:"What capability means",body:`**Process capability** is the **inherent ability of a process to meet customer expectations without any additional efforts** — time, money, manpower, technology or manipulation (p. 207). It shows whether the process has:

- a **centring** issue (relative to the spec limits),
- a **variation** issue,
- a **combination** of both, or
- **inappropriate specification limits**.

It also gives a **baseline metric** for improvement.

Capability analysis turns a practical problem into a statistical one: *what is the probability that the process produces a defect?* (p. 208). It compares the **output variation width** with the **specification width**.

**Steps** (p. 211): 1 select the output; 2 verify customer requirements; 3 **validate the specification limits**; 4 collect sample data; 5 decide whether the data are **long-term or short-term**; 6 **check normality**; 7 calculate Z, PPM, yield and Cp, Cpk, Pp, Ppk.

Specifications must be **verified** first: their source (VOC, business, compliance, design), whether they are current, and whether they are understood and agreed (p. 212).`},{heading:"Short-term vs long-term data",body:`| Short-term data (p. 212) | Long-term data |
|---|---|
| Narrow inference space: one shift, line, batch, operator, few suppliers | Broad: many shifts, batches, people, suppliers, months |
| Potentially **free of special causes** | Includes **common and special** causes |
| Shows the **optimal** ("entitlement") performance | Shows real performance over time |
| About 30–50 points (the book also says 20–30) | At least **100–200** points |
| A **snapshot** | A **video** |

**Long-term variation is always larger** than short-term variation: materials, temperature, people, suppliers and wear all add variation (p. 213). Even stable processes **drift by about 1.5 SD** over time (p. 214).

**Baseline** always means **long-term** performance. Do not be misled by volume: 100,000 units made in one day is still short-term; 20 units a day for 3 months is long-term (p. 214). Roughly, a month or more of data is long-term; two weeks or less is short-term.`},{heading:"The four indices",body:`The book calls **Cp and Pp "hope"** (the best the process can be if perfectly centred — potential or entitlement) and **Cpk and Ppk "reality"** (how it actually runs relative to the specs) (p. 216).

$$C_p = \\dfrac{USL - LSL}{6\\,\\sigma_{within}} \\qquad C_{pk} = \\min\\left(\\dfrac{USL - \\bar{x}}{3\\,\\sigma_{within}},\\ \\dfrac{\\bar{x} - LSL}{3\\,\\sigma_{within}}\\right)$$

$$P_p = \\dfrac{USL - LSL}{6\\,s_{overall}} \\qquad P_{pk} = \\min\\left(\\dfrac{USL - \\bar{x}}{3\\,s_{overall}},\\ \\dfrac{\\bar{x} - LSL}{3\\,s_{overall}}\\right)$$

**Exam convention:** Cp and Cpk use the **short-term (within-subgroup)** standard deviation; Pp and Ppk use the **long-term (overall)** standard deviation.

- With only **one** specification limit, Cp and Pp cannot be calculated; use the one-sided part of Cpk or Ppk.
- **Cpk ≤ Cp** always; they are equal only when the process is centred.`},{heading:"Worked example: the book's camshaft suppliers",body:`Specs: LSL = 598, USL = 602 (width 4). **Supplier 1** (p. 218): mean 599.115, within SD 0.559, overall SD 0.603.

$$C_p = \\dfrac{602 - 598}{6 \\times 0.559} = \\dfrac{4}{3.355} = 1.19$$
$$CPL = \\dfrac{599.115 - 598}{3 \\times 0.559} = \\dfrac{1.115}{1.678} = 0.66 \\qquad CPU = \\dfrac{602 - 599.115}{1.678} = 1.72$$
So **Cpk = 0.66** (the smaller one).
$$P_p = \\dfrac{4}{6 \\times 0.603} = 1.11 \\qquad P_{pk} = \\dfrac{1.115}{3 \\times 0.603} = 0.62$$

**Supplier 2:** mean 600.06 (well centred), Cp = 0.66, Cpk = 0.64, Pp = 0.58, Ppk = 0.56.

**Interpretation:**
- Supplier 1: Cp 1.19 but Cpk 0.66 → mainly a **centring** problem (mean too close to the LSL); about 32,000 PPM below the LSL long-term.
- Supplier 2: Cp ≈ Cpk ≈ 0.6 → a **variation** problem; defects on both sides (about 81,000 PPM total).

The book chooses to work with **Supplier 1**, because moving a mean is usually easier than reducing variation.`},{heading:"How to read and decide",body:`| Pattern | Meaning | Action |
|---|---|---|
| Cp ≈ Cpk | Process is centred | Look at spread only |
| Cp much larger than Cpk | **Off-centre** | **Shift the mean** — usually the easiest option |
| Cp < 1 | Spread wider than the specs | **Reduce variation** — harder, common in projects |
| Cpk much larger than Ppk | Big shifts **over time** (between subgroups) | Find what changes between days, shifts, suppliers |

**Benchmarks:** Cpk = 1.0 means the nearest spec is 3 SD away (process just fits). **Cpk ≥ 1.33** (4 SD) is the usual minimum target; **Cpk = 2.0** is six sigma short-term.

**Problem-solving options** (pp. 209–210): shift the mean; reduce variation; both (the main objective of Six Sigma); or **widen the specs** (customers rarely agree). If the process is both off-target and too variable, **reduce and control variation first**, because high variation makes it hard to know if a mean shift worked — unless a simple adjustment moves the mean.`},{heading:"Caveats",body:`- **Normality first:** capability indices assume **normally distributed** data. Always run a normality test before capability (p. 221). If the data are non-normal (e.g., **bimodal**), the predicted PPM is wrong. In Measure, **report observed performance** and go and find the cause of the two distributions.
- **Stability:** capability is **most meaningful on a stable, predictable process** (p. 211). In Measure, however, the baseline is a "line in the sand" — do not wait to make the process stable before measuring it (p. 217).
- **MSA first:** a poor gage inflates the observed spread and makes capability look worse.
- **Minitab settings:** Minitab's default treats data as long-term with subgroups. For short-term data, set the subgroup size equal to the total number of points, or turn off the within-subgroup analysis (p. 220). Ask for **Benchmark Z** to get the sigma level: the book's Supplier 1 has Z.bench 1.99 within and **1.85 overall** (p. 219).
- Capability is about **specification limits** (customer), never **control limits** (process).`}],keyPoints:["Capability compares the voice of the process with the voice of the customer (spec limits).","Cp compares spec width with 6σ; Cpk uses the distance to the nearest spec limit: $$C_p = \\dfrac{USL - LSL}{6\\sigma} \\qquad C_{pk} = \\dfrac{\\text{nearest spec distance}}{3\\sigma}$$","Cp/Cpk use short-term (within) σ; Pp/Ppk use long-term (overall) σ.",'Cp and Pp = potential ("hope"); Cpk and Ppk = actual performance ("reality").',"Cpk < Cp means the process is off-centre; Cp < 1 means too much variation.","Cpk ≥ 1.33 is the usual minimum; Cpk = 2.0 is six sigma.","Long-term variation is always larger than short-term; the baseline uses long-term data.","Check MSA and normality before capability."],examTips:["Most common calculation: Cpk with an off-centre mean — compute both sides and take the smaller.","Trap: using control limits instead of spec limits in a capability formula.","Trap: one-sided specification — Cp cannot be calculated; only Cpk (one side) can.",'If asked which improvement is "usually easiest", the answer is shifting the mean.',"Large gap between Cpk and Ppk = process not stable over time (special causes or drift between subgroups)."]},{topic:"2.4.2",title:"Concept of Stability",pages:"Book pp. 209–217 (+ pp. 158, 523–533)",doc:"book-201-300",pdfPage:12,intro:"A **stable** process is one whose results are **consistent and predictable over time** because only common cause variation is present. Stability is checked with time series plots and control charts. It matters because capability numbers only predict the future when the process is stable.",sections:[{heading:"What stability means",body:`**A stable process is consistent over time** (p. 211). Its output varies, but in a **predictable** way: the points fall randomly around the average, with no trends, shifts or unusual outliers (p. 517).

The book explains why stability matters (p. 209): variation exists in everything and cannot be removed completely. We can **tolerate variability** if it is **small compared with the requirements** and the process shows **long-term stability** — the variation is predictable and the average is on target.

Stability is the same as being **"in statistical control"**. In the Measure roadmap, after the measurement system is accepted, the next step is **"Assess Stability (Statistical Control)"**, and then **"Assess Capability"** (p. 230).`},{heading:"Common cause and special cause",body:`Every process has two kinds of variation (pp. 158, 523):

| | **Common cause** | **Special cause** |
|---|---|---|
| Also called | Natural variability, noise | **Assignable cause**, unnatural variability |
| Source | Many **unknown** small factors | **Known** (findable) factors, or a pattern change |
| Pattern | Steady, **random** around the average; often normal | **Non-random**: outliers, shifts, trends, cycles |
| Example | Small day-to-day differences in call length | System outage, new untrained agent, wrong vendor batch |
| Action | Do not adjust for single points; improve the **system** | **Investigate**, remove and prevent recurrence |

Common cause is "the variation left over after special cause variation has been removed" (p. 158).

The book says **special causes = opportunity**: removing them often gives big, quick gains. Reacting to common cause as if it were special (adjusting after every point) is **tampering** and increases variation (p. 544).`},{heading:"How to check stability",body:`Stability is established with a **time series plot** or a **control chart** (p. 215). Points out of control mean the data are **not stable**.

A **control chart** is a time series plot plus a **centre line** and **control limits** at **±3 standard deviations**, calculated **from the process data** (pp. 525–527):
- For a normal process, **99.73%** of points fall inside the limits.
- Only about **0.27%** fall outside by chance — about **0.135% on each side** (the book rounds to 0.15%).
- So a point outside the limits almost certainly has a **special cause**.

Control limits are the **voice of the process**. **Never draw specification limits on a control chart** (p. 524).

**Common special-cause rules** (book pp. 532–533; exam convention):
1. One point beyond **3σ** from the centre line
2. **9 points in a row** on the same side of the centre line
3. **6 points in a row** steadily increasing or decreasing
4. **14 points in a row** alternating up and down
5. 2 of 3 points beyond 2σ (same side); 4 of 5 beyond 1σ (same side)

(Some rule sets, e.g., Western Electric, use 8 in a row; the exam uses **9 in a row**.)`},{heading:"Stability is not capability",body:`A process **in control** is not necessarily **capable** (p. 518). In control only means stable, consistent and predictable. Capability compares the process with the **specification**.

| | **Capable** | **Not capable** |
|---|---|---|
| **Stable** | Ideal: predictable and meets specs | Predictably makes defects — reduce variation or shift the mean |
| **Not stable** | Meets specs for now, but unpredictable | Worst case: remove special causes first |

**Capability studies are most meaningful on stable processes** (p. 211). If a process is unstable, its capability today does not predict tomorrow.

**Entitlement** (p. 215): on a time series plot, the region where the variation is **tightest** shows the process **entitlement** — the best short-term performance it has already achieved. If we find the X's that cause the instability, we should be able to perform like that again.

Short-term data is "potentially free of special causes"; long-term data includes both common and special causes (p. 212).`},{heading:"Stability in the Measure phase",body:`**No reason to assume stability.** At this point in Measure there is no reason to assume the process is stable (p. 215). A capability study now simply **"draws a line in the sand"** — the baseline.

**Do not try to make the process stable before working on it** (p. 217). It is a project because something is wrong with it; go and find out what.

The **Measure checklist** asks (p. 231):
- Is the **voice of the process stable**?
- If not, have the **special causes been acknowledged**?
- Can the **good signals** be built into the process?
- Can the **bad signals** be removed?
- How stable **can** you make the process?

**Example:** daily average ticket-resolution time is plotted for 30 days. Day 12 is above the UCL — it was the day of a system outage (special cause: record it, do not mix it into the baseline as normal behaviour). Later, after a new script is introduced, 9 days in a row fall below the centre line — a **shift**, which here is a good signal to build into the process.`}],keyPoints:["Stable = consistent and predictable over time = in statistical control (only common cause variation).","Common cause: unknown, random, natural. Special cause: assignable, non-random, findable.","Check stability with a time series plot or control chart (limits at ±3σ from the process data).","99.73% of points fall within ±3σ; a point outside signals a special cause.","Run rules: 1 point beyond 3σ, 9 in a row on one side, 6 in a row trending, 14 alternating.","In control does not mean capable; capability is most meaningful on a stable process.","Never put specification limits on a control chart.","Adjusting a stable process for common cause variation (tampering) makes it worse."],examTips:['Trap: "the process is in control, so it meets the customer requirements" — false.',"Use the exam rule of 9 points in a row on one side of the centre line for a shift.","Control limits come from the process (voice of the process); spec limits come from the customer.","If a question asks what to do with a common-cause-only process that is not capable: change the system (reduce variation / shift mean), do not chase individual points."]},{topic:"2.4.3",title:"Attribute & Discrete Capability",pages:"Book pp. 221–225",doc:"book-201-300",pdfPage:24,intro:"When the output is a **count of defects or defectives** (not a measurement), we cannot use the normal-curve formulas directly. Instead we turn the defect rate (DPU, DPMO or proportion defective) into a **Z-score**, then into a **sigma level** and **Cpk/Ppk**, using the 1.5-sigma shift.",sections:[{heading:"Why attribute capability is different",body:`For continuous data, the capability steps include **checking for normality** and then calculating Cp, Cpk, Pp, Ppk. For attribute data we **"hit a wall"** at that step: attribute data are not normal, so a different method is used (p. 221).

**Attribute capability steps** (p. 222):
1. Select the output for improvement
2. Verify customer requirements
3. Validate the specification limits (what counts as a defect)
4. Collect sample data
5. **Calculate DPU** (or proportion defective, DPMO)
6. **Find the Z-score** from the Z table
7. **Convert the Z-score to Cp and Cpk** (and Pp, Ppk)

Capability studies can be done on **both discrete and continuous** data (p. 211).`},{heading:"Defect and defective measures",body:`A **defect** is a failure to meet any one requirement; a **defective** is a whole unit that fails (it may contain one or more defects) (p. 530).

$$DPU = \\dfrac{\\text{total defects}}{\\text{total units}}$$

$$\\text{Proportion defective } p = \\dfrac{\\text{defective units}}{\\text{total units}}$$

$$DPMO = \\dfrac{\\text{total defects}}{\\text{units} \\times \\text{opportunities per unit}} \\times 1{,}000{,}000$$

**PPM** (parts per million) = proportion defective × 1,000,000. **Yield** = 1 − proportion defective.

Use the measure that fits the data. Pass/fail units (a dropped call, a late order) give a **proportion defective**. Countable flaws per unit (errors on a form) give **DPU**. When units have different numbers of chances to fail, **DPMO** makes processes comparable, because it counts **opportunities**. Define an opportunity carefully: it must be a real chance for a defect that the customer cares about, or the sigma level will look better than it is.

**Worked example:** 500 claim forms, each with **13 fields** (opportunities); 130 defects found.
$$DPU = \\dfrac{130}{500} = 0.26 \\qquad DPMO = \\dfrac{130}{500 \\times 13} \\times 1{,}000{,}000 = 20{,}000$$

A proportion of 0.02 per opportunity gives $Z_{LT} \\approx 2.05$, so the short-term sigma level is about 3.55.`},{heading:"Z-scores and the Z table",body:`A **Z-score** is the distance, in standard deviations, of a value from the mean (p. 222). The Z table links a Z-score to the **tail area** (the proportion beyond it).

**Forward (Z → proportion)** — book example: mean 50, SD 3, USL 54.
$$Z = \\dfrac{54 - 50}{3} = 1.33$$
The table gives a tail area of **0.09176**, so about 9.2% are beyond the limit:
$$0.09176 \\times 1{,}000{,}000 = 91{,}760 \\text{ PPM}$$

**Reverse (proportion → Z)** — used for attribute data: find the defect proportion inside the table and read off the Z.
- Proportion 0.1333 → Z ≈ **1.11**
- Proportion 0.02 → Z ≈ **2.05**
- Proportion 0.00135 → Z = **3.00**`},{heading:"Short-term, long-term and the 1.5 shift",body:`**Attribute data are always long-term** ("in the shifted condition"), because you need many samples over a long time to estimate a defect rate with confidence (p. 223). But capability is usually **reported short-term**, so we shift:

$$Z_{ST} = Z_{LT} + 1.5$$

The reason: a stable process can **drift by up to 1.5 SD** over time.

**Converting Z to the indices** (p. 224):
$$C_{pk} = \\dfrac{Z_{ST}}{3} \\qquad P_{pk} = \\dfrac{Z_{LT}}{3}$$

**Sigma level table** (book p. 223):

| Sigma level (Z ST) | Short-term DPMO | Long-term DPMO |
|---|---|---|
| 1 | 158,655 | 691,462 |
| 2 | 22,750 | 308,538 |
| 3 | 1,350 | **66,807** |
| 4 | 31.7 | **6,210** |
| 5 | 0.3 | 233 |
| 6 | 0.0 | **3.4** |

The famous "six sigma = **3.4 DPMO**" uses the **long-term** (shifted) column.`},{heading:"Worked example: the book's call centre",body:`A call centre received **20,000 calls** in a month; **2,666** dropped before being answered (p. 224).

**Step 1 – proportion defective (the book calls it DPU):**
$$p = \\dfrac{2{,}666}{20{,}000} = 0.1333$$

**Step 2 – look up Z (long-term):** a tail area of 0.1333 gives $Z_{LT} = 1.11$.

**Step 3 – shift to short-term:**
$$Z_{ST} = 1.11 + 1.5 = 2.61$$

**Step 4 – indices:**
$$C_{pk} = \\dfrac{2.61}{3} = 0.87 \\qquad P_{pk} = \\dfrac{1.11}{3} = 0.37$$

DPMO = 0.1333 × 1,000,000 ≈ **133,300**.

**Decision:** Cpk 0.87 is far below the desired **1.33** (about 4 sigma; p. 225). The call centre is about a **2.6 sigma** process. As the book notes, the long-term Ppk is worse than the short-term Cpk because of the 1.5 shift. Use **Cpk** to judge the ability to meet CTQs; Ppk shows how much variation the process really shows over time.`}],keyPoints:["Attribute data cannot use normal-curve capability formulas directly — go via DPU/DPMO → Z.","DPU and DPMO: $$DPU = \\dfrac{\\text{defects}}{\\text{units}} \\qquad DPMO = \\dfrac{\\text{defects}}{\\text{units} \\times \\text{opportunities}} \\times 10^6$$","Defect = one failed requirement; defective = a whole unit that fails.","Attribute data are long-term; Z(ST) = Z(LT) + 1.5.","From Z to the indices: $$C_{pk} = \\dfrac{Z_{ST}}{3} \\qquad P_{pk} = \\dfrac{Z_{LT}}{3}$$","Six sigma = 3.4 DPMO long-term; 3 sigma ≈ 66,807 DPMO long-term.","Cpk ≥ 1.33 (about 4 sigma) is the usual minimum."],examTips:["Know which direction to apply the 1.5 shift: long-term → short-term ADD 1.5; short-term → long-term SUBTRACT 1.5.","Trap: forgetting opportunities per unit in DPMO — DPU and DPMO are not the same.","Reverse Z-table look-ups (proportion → Z) are common in attribute capability questions.","If a sigma level is quoted without saying short- or long-term, assume the short-term (shifted) convention used in the sigma table."]},{topic:"2.4.4",title:"Monitoring Techniques",pages:"Book pp. 516–530 (+ pp. 183, 211, 230–231)",doc:"book-501-600",pdfPage:19,intro:"**Monitoring** means watching the process over time so you know its baseline, see when it changes and can prove that an improvement worked. The main tools are **time series plots and control charts**, fed by a good data collection plan with rational subgroups and sensible sampling frequency.",sections:[{heading:"Why we monitor, and what",body:`In Measure we set the baseline. But the process keeps running while we improve it, so we must **keep watching** it. Control charts are used to (p. 516):
- determine the **baseline performance** of a process,
- **evaluate measurement systems** (gage stability, p. 183),
- **compare** several processes,
- **compare a process before and after a change**.

**Y = f(X):** we can only **monitor** an output; we **control** it by controlling the inputs (p. 526).
- Control charts on **inputs (critical X's)** = **Statistical Process Control (SPC)**.
- Control charts on **outputs (Y's, CTQs)** = **Statistical Process Monitoring (SPM)** (p. 530).

The book warns that people who applied SPC only to outputs were often disappointed. When the vital few X's are found, consider SPC on the **X's**. Capability studies are also meant to be **regular, periodic** estimates (p. 211).`},{heading:"Monitoring tools",body:`**Time series plot (run chart)** — data in time order; every project should have one (p. 167).

**Control chart** — a time series plot plus a **centre line** and **control limits at ±3σ** calculated from the data (p. 526). It has two jobs: give **time-based information** about the process, and **alert you** when special cause variation occurs (p. 527).

**Choosing a control chart** (p. 530):

| Data | Subgroup | Chart |
|---|---|---|
| Continuous | n = 1 (individual values) | **I-MR** (individuals and moving range) |
| Continuous | n = 2–9 (often 3–5) | **Xbar-R** |
| Continuous | n ≥ 10 | **Xbar-S** |
| Defectives (pass/fail) | constant or variable n | **NP** (count) or **P** (proportion) |
| Defects (count of flaws) | constant or variable area | **C** (count) or **U** (per unit) |

The P and U charts handle **varying sample sizes**, so their limits look uneven (pp. 520–521).`},{heading:"Collecting good monitoring data",body:`**Let the process run normally.** Any special treatment while sampling makes the chart invalid (p. 517).

**Rational subgroups:** items made under **very similar conditions in a short time** — usually **3 to 5 consecutive units** (e.g., 4 holes drilled one after the other). Five items made at the same time on **different machines** are **not** a rational subgroup (p. 519). Subgroups should contain **only common cause variation**, so other sources show up as signals (p. 528).

**Avoid bias:** do not chart only the first shift, only one vendor's material, or only samples taken just before lunch. Use **separate charts** for separate streams (machines, operators) (p. 517).

**Sampling frequency** (p. 529): a balance between the **cost of sampling** and the **cost of missing a shift**. Start by sampling **more often**, then reduce if the process stays in control. Rule of thumb: sample **at least 10 times more often** than out-of-control conditions occur.

The Measure checklist asks: **where are the data collection points?** (p. 231).`},{heading:"Setting up a control chart",body:`The book's **control chart "cookbook"** (p. 525):

1. Select the characteristic (critical X or CTQ)
2. Determine the purpose of the chart
3. Select data collection points
4. Establish the basis for sub-grouping (for Y's)
5. Select the type of control chart
6. Determine the measurement method / criteria
7. Establish the sampling interval / frequency
8. Determine the sample size
9. Establish how control limits will be calculated
10. Set up forms or software for charting
11. Set up forms or software for collecting data
12. Write instructions for all phases
13. Train the people involved

Remember: **control limits** describe the process and are **unrelated to customer specifications** (voice of the process, not voice of the customer). If the control limits are **wider than the specs**, the process is not capable (Cp < 1.0).`},{heading:"Worked example: limits for a P chart",body:`A service team monitors the **proportion of orders delivered late**. Each day 400 orders are checked; over 25 days the average is $\\bar{p} = 0.08$.

**Standard deviation of a proportion:**
$$\\sigma_p = \\sqrt{\\dfrac{\\bar{p}(1 - \\bar{p})}{n}} = \\sqrt{\\dfrac{0.08 \\times 0.92}{400}} = \\sqrt{0.000184} = 0.0136$$

**Control limits:**
$$UCL = 0.08 + 3 \\times 0.0136 = 0.121 \\qquad LCL = 0.08 - 3 \\times 0.0136 = 0.039$$

So a normal day has between about **3.9% and 12.1%** late orders. A day with 14% late is a **special-cause signal**: investigate (a courier problem? a system outage?). A day with 10% late is **common cause**: do not react to it alone.

If after an improvement 9 days in a row fall below 8%, the process has **shifted**. Confirm the change (e.g., with a hypothesis test) before you recalculate the limits.`},{heading:"Reacting to what you see",body:`- **Only common cause variation:** do **not** adjust the process point by point. This saves "wild goose chases" (p. 517). Adjusting on every point (tampering) increases variation.
- **Special cause signal:** **investigate** what created it and **prevent it** from happening again. Some action is always required (p. 517). The chart says the process is out of control, but **not why** (p. 523).
- **Gage monitoring:** chart a master part over time to watch **measurement stability** (p. 183).
- **Before/after:** keep the same chart running through the improvement to show the change.
- **Visual management:** charts posted where the work happens let staff see how the process is running at a glance (p. 523).

Do not "do SPC for the sake of doing SPC": a chart nobody reacts to becomes **wallpaper** (p. 522). The Measure roadmap moves from **assess stability → assess capability → estimate sigma level** (p. 230); in Control, monitoring becomes part of the **control plan**.`}],keyPoints:["Control charts set the baseline, check measurement systems, compare processes and compare before/after.","SPC on X's = control; charts on Y's (CTQs) = statistical process monitoring (SPM).","Control limits = mean ± 3σ from the process data — the voice of the process, never the specs.","Chart choice: I-MR (n = 1), Xbar-R (small subgroups), P/NP for defectives, U/C for defects.","Rational subgroup = 3–5 consecutive units made under the same conditions.","Sample at least 10 times more often than out-of-control events occur; start frequent, then reduce.","React to special causes; do not adjust for common cause variation (tampering)."],examTips:["Questions on chart selection: first decide continuous vs attribute, then subgroup size, then defects vs defectives.","Trap: a rational subgroup made from different machines or operators at the same time is wrong.","Monitoring a CTQ output is SPM; controlling the critical inputs is SPC.","A control chart detects that something changed, not why — root cause still needs investigation."]}],Xe=Object.freeze(Object.defineProperty({__proto__:null,lessons:Fe},Symbol.toStringTag,{value:"Module"})),Ve=new Set(["1.1.4","1.1.6","1.2.2","1.2.4","1.2.5","1.3.1","1.4.4","1.4.5","2.1.1","2.1.2","2.1.4","2.2.2","2.2.3","2.3.3","2.3.4","2.4.1","2.4.2","3.1.1","3.2.3","3.3.1","3.3.2","3.3.3","3.3.4","3.4.1","3.4.3","3.5.8","4.1.1","4.1.2","4.1.3","4.2.2","5.1.3","5.2.1","5.2.2","5.2.10","5.3.2"]),ze={scenario:2,"best-action":2,graph:1.8,output:1.8,"not-except":1.6,statements:1.6,table:1.5,concept:1.6,sequence:1.3,"missing-word":1.3,"true-false":1.3,calculation:.3},He=o=>{let r=2166136261;for(let l=0;l<o.length;l++)r^=o.charCodeAt(l),r=Math.imul(r,16777619);return(r>>>0)/4294967296};function Ye(o){const r=new Map;for(const l of o){const i=`${l.phase}|${l.topic}`;(r.get(i)??r.set(i,[]).get(i)).push(l)}for(const[l,i]of r){const d=Math.max(2,Math.ceil(i.length*(Ve.has(l.split("|")[1])?.4:.2))),u=g=>ze[g.qtype]+(g.trap?1.2:0)+(g.difficulty===2?1:g.difficulty===3?.6:.5)+He(g.id)*1.5;[...i].sort((g,m)=>u(m)-u(g)).forEach((g,m)=>{g.focus=m<d})}return o}const Ue=Object.assign({"./solved/analyze-2.ts":()=>a(()=>import("./analyze-2-C4XG_miz.js"),[],import.meta.url),"./solved/analyze-3.ts":()=>a(()=>import("./analyze-3-BjnVpbik.js"),[],import.meta.url),"./solved/analyze-4.ts":()=>a(()=>import("./analyze-4-CS807lBn.js"),[],import.meta.url),"./solved/analyze-5.ts":()=>a(()=>import("./analyze-5-ChdMY-lM.js"),[],import.meta.url),"./solved/analyze-graph.ts":()=>a(()=>import("./analyze-graph-CEgBoOV3.js"),[],import.meta.url),"./solved/analyze.ts":()=>a(()=>import("./analyze-2bimKZtK.js"),[],import.meta.url),"./solved/b1-1041.ts":()=>a(()=>import("./b1-1041-DFU5TIU1.js"),[],import.meta.url),"./solved/b1-1141.ts":()=>a(()=>import("./b1-1141-COVL2Qv4.js"),[],import.meta.url),"./solved/b1-1241.ts":()=>a(()=>import("./b1-1241-HXjQ4hZ7.js"),[],import.meta.url),"./solved/b1-1341.ts":()=>a(()=>import("./b1-1341-C_SR_0wZ.js"),[],import.meta.url),"./solved/b1-441.ts":()=>a(()=>import("./b1-441-BhAGlT8h.js"),[],import.meta.url),"./solved/b1-541.ts":()=>a(()=>import("./b1-541-B9KWm9p7.js"),[],import.meta.url),"./solved/b1-641.ts":()=>a(()=>import("./b1-641-DdoyG8qU.js"),[],import.meta.url),"./solved/b1-741.ts":()=>a(()=>import("./b1-741-CZmn1QP-.js"),[],import.meta.url),"./solved/b1-841.ts":()=>a(()=>import("./b1-841-CQxu3F3X.js"),[],import.meta.url),"./solved/b1-941.ts":()=>a(()=>import("./b1-941-D0T1bOIj.js"),[],import.meta.url),"./solved/b2-1041.ts":()=>a(()=>import("./b2-1041-Vy38YyEr.js"),[],import.meta.url),"./solved/b2-1141.ts":()=>a(()=>import("./b2-1141-DpKXCZV6.js"),[],import.meta.url),"./solved/b2-1241.ts":()=>a(()=>import("./b2-1241-D8oC-k4S.js"),[],import.meta.url),"./solved/b2-1341.ts":()=>a(()=>import("./b2-1341-Coi06RN4.js"),[],import.meta.url),"./solved/b2-1441.ts":()=>a(()=>import("./b2-1441-BTAhzmW2.js"),[],import.meta.url),"./solved/b2-1541.ts":()=>a(()=>import("./b2-1541-BC6C7f7b.js"),[],import.meta.url),"./solved/b2-1641.ts":()=>a(()=>import("./b2-1641-BqXqFXNk.js"),[],import.meta.url),"./solved/b2-1741.ts":()=>a(()=>import("./b2-1741-D1Qaa6SN.js"),[],import.meta.url),"./solved/b2-1841.ts":()=>a(()=>import("./b2-1841-B5G3Owm-.js"),[],import.meta.url),"./solved/b2-1941.ts":()=>a(()=>import("./b2-1941-CtikhhX5.js"),[],import.meta.url),"./solved/b2-441.ts":()=>a(()=>import("./b2-441-DxRZji8E.js"),[],import.meta.url),"./solved/b2-541.ts":()=>a(()=>import("./b2-541-DniapO7l.js"),[],import.meta.url),"./solved/b2-641.ts":()=>a(()=>import("./b2-641-CPNdTGj3.js"),[],import.meta.url),"./solved/b2-741.ts":()=>a(()=>import("./b2-741-CP0t0Z7I.js"),[],import.meta.url),"./solved/b2-841.ts":()=>a(()=>import("./b2-841-BvYEnUUi.js"),[],import.meta.url),"./solved/b2-941.ts":()=>a(()=>import("./b2-941-CnH3pgK5.js"),[],import.meta.url),"./solved/b3-1031.ts":()=>a(()=>import("./b3-1031-ZUH7e3wk.js"),[],import.meta.url),"./solved/b3-1131.ts":()=>a(()=>import("./b3-1131-BlpyMa7R.js"),[],import.meta.url),"./solved/b3-1231.ts":()=>a(()=>import("./b3-1231-BKTpajj7.js"),[],import.meta.url),"./solved/b3-1331.ts":()=>a(()=>import("./b3-1331-Du0JNZIy.js"),[],import.meta.url),"./solved/b3-1431.ts":()=>a(()=>import("./b3-1431-Cex-I4R6.js"),[],import.meta.url),"./solved/b3-431.ts":()=>a(()=>import("./b3-431-D0b0FQFi.js"),[],import.meta.url),"./solved/b3-531.ts":()=>a(()=>import("./b3-531-9dlOArZS.js"),[],import.meta.url),"./solved/b3-631.ts":()=>a(()=>import("./b3-631-CfTRrYgu.js"),[],import.meta.url),"./solved/b3-731.ts":()=>a(()=>import("./b3-731-DrASMAoK.js"),[],import.meta.url),"./solved/b3-831.ts":()=>a(()=>import("./b3-831-DdBrf1Di.js"),[],import.meta.url),"./solved/b3-931.ts":()=>a(()=>import("./b3-931-DSHul1OM.js"),[],import.meta.url),"./solved/b4-316.ts":()=>a(()=>import("./b4-316-CULbGRZv.js"),[],import.meta.url),"./solved/b4-416.ts":()=>a(()=>import("./b4-416-Cn-UMIw2.js"),[],import.meta.url),"./solved/b4-516.ts":()=>a(()=>import("./b4-516-BsXWdKKX.js"),[],import.meta.url),"./solved/b4-616.ts":()=>a(()=>import("./b4-616-CtQuwoXC.js"),[],import.meta.url),"./solved/b5-1026.ts":()=>a(()=>import("./b5-1026-L1_UbIHi.js"),[],import.meta.url),"./solved/b5-1126.ts":()=>a(()=>import("./b5-1126-CbJFb2ek.js"),[],import.meta.url),"./solved/b5-1226.ts":()=>a(()=>import("./b5-1226-BWI_HNnk.js"),[],import.meta.url),"./solved/b5-1326.ts":()=>a(()=>import("./b5-1326-C6W13lmA.js"),[],import.meta.url),"./solved/b5-426.ts":()=>a(()=>import("./b5-426-C7k-jDBC.js"),[],import.meta.url),"./solved/b5-526.ts":()=>a(()=>import("./b5-526-yFv_97ms.js"),[],import.meta.url),"./solved/b5-626.ts":()=>a(()=>import("./b5-626-CXsZ8Vy_.js"),[],import.meta.url),"./solved/b5-726.ts":()=>a(()=>import("./b5-726-Clfw1vx6.js"),[],import.meta.url),"./solved/b5-826.ts":()=>a(()=>import("./b5-826-AGekrkKf.js"),[],import.meta.url),"./solved/b5-926.ts":()=>a(()=>import("./b5-926-CI_p1-Hd.js"),[],import.meta.url),"./solved/control-2.ts":()=>a(()=>import("./control-2-Dy5dDP43.js"),[],import.meta.url),"./solved/control-3.ts":()=>a(()=>import("./control-3-C270ahEM.js"),[],import.meta.url),"./solved/control-4.ts":()=>a(()=>import("./control-4-DJ-vbmu8.js"),[],import.meta.url),"./solved/control-5.ts":()=>a(()=>import("./control-5-DXhb-WPi.js"),[],import.meta.url),"./solved/control-graph.ts":()=>a(()=>import("./control-graph-QJgmFraP.js"),[],import.meta.url),"./solved/control.ts":()=>a(()=>import("./control-Dg-nsEQB.js"),[],import.meta.url),"./solved/define-2.ts":()=>a(()=>import("./define-2-BU7pkHL3.js"),[],import.meta.url),"./solved/define-3.ts":()=>a(()=>import("./define-3-DowRhpKc.js"),[],import.meta.url),"./solved/define-4.ts":()=>a(()=>import("./define-4-DQ9hftzu.js"),[],import.meta.url),"./solved/define-5.ts":()=>a(()=>import("./define-5-DJkhAiZ_.js"),[],import.meta.url),"./solved/define-6.ts":()=>a(()=>import("./define-6-DaK-KrTb.js"),[],import.meta.url),"./solved/define-graph.ts":()=>a(()=>import("./define-graph-BHxCij9R.js"),[],import.meta.url),"./solved/define.ts":()=>a(()=>import("./define-D3PNJFaW.js"),[],import.meta.url),"./solved/improve-3.ts":()=>a(()=>import("./improve-3-B4bOKuIz.js"),[],import.meta.url),"./solved/improve-4.ts":()=>a(()=>import("./improve-4-UMSYV1gk.js"),[],import.meta.url),"./solved/improve-5.ts":()=>a(()=>import("./improve-5-F4OZE_kE.js"),[],import.meta.url),"./solved/improve-graph.ts":()=>a(()=>import("./improve-graph-mLtrH_Kl.js"),[],import.meta.url),"./solved/improve.ts":()=>a(()=>import("./improve-B_7t8ewq.js"),[],import.meta.url),"./solved/measure-2.ts":()=>a(()=>import("./measure-2-B44kLLlS.js"),[],import.meta.url),"./solved/measure-3.ts":()=>a(()=>import("./measure-3-B_35wSEu.js"),[],import.meta.url),"./solved/measure-4.ts":()=>a(()=>import("./measure-4-DuFc6eM3.js"),[],import.meta.url),"./solved/measure-5.ts":()=>a(()=>import("./measure-5-DpbiJaSz.js"),[],import.meta.url),"./solved/measure-graph.ts":()=>a(()=>import("./measure-graph-CvaAU6l3.js"),[],import.meta.url),"./solved/measure.ts":()=>a(()=>import("./measure-b6TmMR4s.js"),[],import.meta.url)}),Ke=(o,r)=>o.phase-r.phase||o.topic.localeCompare(r.topic,void 0,{numeric:!0})||o.id.localeCompare(r.id);let E=null;function Qe(o){if(E)return E;const r=Object.values(Ue);let l=0;return E=Promise.all(r.map(i=>i().then(d=>(l++,o==null||o(l,r.length),d.items)))).then(i=>Ye(i.flat().sort(Ke))).catch(i=>{throw E=null,i}),E}const U={graph:"Minitab graph",statements:"Which statements?","missing-word":"Missing word","best-action":"Best action",calculation:"Calculation",output:"Minitab output",table:"Read a table",concept:"Concept",scenario:"Scenario","not-except":"NOT / EXCEPT","true-false":"True / False",sequence:"Sequence"},Ge=Object.assign({"./bookLessons/analyze.ts":Ee,"./bookLessons/control.ts":je,"./bookLessons/define.ts":We,"./bookLessons/improve.ts":Ne,"./bookLessons/measure.ts":Xe}),Ze=Object.fromEntries(Object.values(Ge).flatMap(o=>o.lessons).map(o=>[o.topic,o])),L=["A","B","C","D"],K={1:["Easy","bg-teal/15 text-teal"],2:["Medium","bg-sky/15 text-sky"],3:["Hard / trap","bg-coral/15 text-coral"]};function nt(){const[o,r]=Me(),l=(t,s)=>{const I=o.get(t);return new Set(I?I.split(",").filter(Boolean).map(s):[])},i=(()=>{try{return JSON.parse(localStorage.getItem("sv-solved-filters")??"{}")}catch{return{}}})(),d=["phase","type","diff","focus"].some(t=>o.get(t)),[u,g]=h.useState(d?l("phase",t=>Number(t)):new Set(i.phases??[])),[m,w]=h.useState(d?l("type",t=>t):new Set(i.types??[])),[c,P]=h.useState(d?l("diff",Number):new Set(i.diffs??[])),[b,v]=h.useState(d?o.get("focus")||"all":i.focus??"all"),[k,p]=h.useState(i.show??"all"),[n,C]=h.useState(i.noCalc??!1),[y,_]=h.useState(i.shuffle??!1),[N,pe]=h.useState(()=>Math.floor(Math.random()*1e9)),[F,ue]=h.useState(!1),[R,X]=h.useState(0),q=B(t=>t.solvedTries)??{},[T,fe]=h.useState([]),[ge,be]=h.useState(0),[ye,ve]=h.useState(!1);h.useEffect(()=>{let t=!0;return Qe((s,I)=>t&&be(s/I)).then(s=>t&&fe(s)).catch(()=>t&&ve(!0)),()=>{t=!1}},[]);const we=B(t=>t.clearSolved),V=(t,s,I)=>{const $=new Set(t);$.has(s)?$.delete(s):$.add(s),I($)},M=(t,s)=>(s==="focus"||b==="all"||b==="core"==!!t.focus)&&(s==="phase"||!u.size||u.has(t.phase))&&(s==="type"||!m.size||m.has(t.qtype))&&(s==="diff"||!c.size||c.has(t.difficulty))&&(!n||t.qtype!=="calculation")&&(k==="all"||(k==="new"?!q[t.id]:!!q[t.id]&&!q[t.id].ok)),[ke,Z]=h.useState(0),A=h.useMemo(()=>{const t=T.filter($=>M($));if(!y)return t;let s=N;const I=()=>(s=(s*1664525+1013904223)%4294967296,s/4294967296);for(let $=t.length-1;$>0;$--){const te=Math.floor(I()*($+1));[t[$],t[te]]=[t[te],t[$]]}return t},[T,b,u,m,c,k,n,y,N,ke]);h.useEffect(()=>{X(0)},[b,u,m,c,k,n,y,N]),h.useEffect(()=>{const t=new URLSearchParams;u.size&&t.set("phase",[...u].sort().join(",")),m.size&&t.set("type",[...m].join(",")),c.size&&t.set("diff",[...c].sort().join(",")),b!=="all"&&t.set("focus",b),r(t,{replace:!0});try{localStorage.setItem("sv-solved-filters",JSON.stringify({focus:b,phases:[...u],types:[...m],diffs:[...c],show:k,noCalc:n,shuffle:y}))}catch{}},[b,u,m,c,k,n,y]);const J=b!=="all"||u.size||m.size||c.size||k!=="all"||n,$e=()=>{v("all"),g(new Set),w(new Set),P(new Set),p("all"),C(!1)},z=A[Math.min(R,A.length-1)],H=t=>X(s=>Math.max(0,Math.min(A.length-1,s+t))),j=T.filter(t=>q[t.id]).length,ee=T.filter(t=>{var s;return(s=q[t.id])==null?void 0:s.ok}).length,xe=h.useMemo(()=>Object.keys(U).filter(t=>T.some(s=>s.qtype===t)),[T]),O=t=>T.filter(t).length;return e.jsxs("div",{className:"mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8",children:[e.jsxs("section",{className:"card relative overflow-hidden p-5 sm:p-7",children:[e.jsx("div",{"aria-hidden":!0,className:"pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo/10 blur-2xl"}),e.jsx("p",{className:"label text-indigo",children:"Try it first · then see every step"}),e.jsx("h1",{className:"mt-1 font-display text-2xl font-bold text-ink sm:text-4xl",children:"Solved Question Bank"}),e.jsxs("p",{className:"mt-2 hidden max-w-2xl text-muted sm:block",children:[T.length," PeopleCert-style questions of every type. Pick your answer first; the full solution then opens step by step, with every formula written as a proper fraction. Original practice items, not official exam questions."]}),e.jsxs("div",{className:"relative mt-4 flex flex-wrap items-center gap-3 text-sm",children:[e.jsxs("span",{className:"chip bg-raised text-ink",children:[e.jsx(Te,{size:14})," ",j," / ",T.length," tried"]}),e.jsxs("span",{className:"chip bg-good/10 text-good",children:[e.jsx(Y,{size:14})," ",ee," correct",j?` (${Math.round(ee/j*100)}%)`:""]}),j>0&&e.jsx("button",{type:"button",onClick:()=>{var t;(((t=window.confirm)==null?void 0:t.call(window,"Clear all your answers in this bank?"))??!0)&&(we(),Z(s=>s+1))},className:"text-xs font-semibold text-muted underline-offset-2 hover:text-ink hover:underline",children:"Reset"})]}),e.jsxs("button",{type:"button",onClick:()=>ue(t=>!t),className:"relative mt-4 flex w-full items-center justify-between rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink sm:hidden","aria-expanded":F,children:[e.jsxs("span",{children:["Filters",J?" (on)":""," · ",A.length.toLocaleString()," questions"]}),e.jsx(le,{size:16,className:`transition ${F?"rotate-180":""}`})]}),e.jsxs("div",{className:`relative mt-5 space-y-3 ${F?"":"hidden sm:block"}`,children:[e.jsxs(D,{label:"Study set",hint:"every question is in one of the two sets",children:[e.jsx(x,{on:b==="all",onClick:()=>v("all"),children:"All"}),e.jsxs(x,{on:b==="core",cls:"bg-amber",onClick:()=>v("core"),children:[e.jsx(Q,{size:12})," Must-know: focus first ",e.jsx("b",{className:"opacity-60",children:O(t=>!!t.focus&&M(t,"focus"))})]}),e.jsxs(x,{on:b==="practice",cls:"bg-indigo",onClick:()=>v("practice"),children:[e.jsx(G,{size:12})," Practice ",e.jsx("b",{className:"opacity-60",children:O(t=>!t.focus&&M(t,"focus"))})]})]}),e.jsxs(D,{label:"Phase",hint:"choose one or more",children:[e.jsx(x,{on:!u.size,onClick:()=>g(new Set),children:"All"}),ce.map(t=>e.jsxs(x,{on:u.has(t.id),cls:me[t.id].bg,onClick:()=>V(u,t.id,g),children:[t.name," ",e.jsx("b",{className:"opacity-60",children:O(s=>s.phase===t.id&&M(s,"phase"))})]},t.id))]}),e.jsxs(D,{label:"Question type",hint:"choose one or more",children:[e.jsx(x,{on:!m.size,onClick:()=>w(new Set),children:"All"}),xe.map(t=>e.jsxs(x,{on:m.has(t),onClick:()=>V(m,t,w),children:[t==="calculation"&&e.jsx(Se,{size:12}),U[t]," ",e.jsx("b",{className:"opacity-60",children:O(s=>s.qtype===t&&M(s,"type"))})]},t))]}),e.jsxs(D,{label:"Difficulty",hint:"choose one or more",children:[e.jsx(x,{on:!c.size,onClick:()=>P(new Set),children:"All"}),[1,2,3].map(t=>e.jsxs(x,{on:c.has(t),cls:t===1?"bg-teal":t===2?"bg-sky":"bg-coral",onClick:()=>V(c,t,P),children:[K[t][0]," ",e.jsx("b",{className:"opacity-60",children:O(s=>s.difficulty===t&&M(s,"diff"))})]},t))]}),e.jsxs(D,{label:"Show",children:[["all","new","wrong"].map(t=>e.jsx(x,{on:k===t,onClick:()=>{p(t),Z(s=>s+1)},children:{all:"All questions",new:"Not tried yet",wrong:"My wrong answers"}[t]},t)),e.jsx(x,{on:n,onClick:()=>C(t=>!t),children:"No calculations"}),e.jsxs(x,{on:y,onClick:()=>{_(t=>!t),pe(Math.floor(Math.random()*1e9))},children:[e.jsx(ae,{size:12})," Random order"]})]}),T.length>0&&e.jsxs("div",{className:"flex flex-wrap items-center gap-2 rounded-xl bg-indigo/5 px-3 py-2 text-sm",children:[e.jsxs("span",{className:"font-semibold text-ink",children:[A.length.toLocaleString()," questions match"]}),J?e.jsx("button",{type:"button",onClick:$e,className:"ml-auto text-xs font-semibold text-indigo hover:underline",children:"Clear filters"}):null]})]})]}),T.length?z?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mt-5 flex items-center gap-2",children:[e.jsx("button",{type:"button",className:"btn-outline px-3 py-2",onClick:()=>H(-1),disabled:R===0,"aria-label":"Previous question",children:e.jsx(Ce,{size:16})}),e.jsxs("span",{className:"flex-1 text-center font-mono text-sm text-muted",children:[R+1," / ",A.length]}),e.jsx("button",{type:"button",className:"btn-outline px-3 py-2",onClick:()=>X(Math.floor(Math.random()*A.length)),"aria-label":"Random question",children:e.jsx(ae,{size:16})}),e.jsx("button",{type:"button",className:"btn-outline px-3 py-2",onClick:()=>H(1),disabled:R>=A.length-1,"aria-label":"Next question",children:e.jsx(de,{size:16})})]}),e.jsx(Je,{q:z,onNext:R<A.length-1?()=>{H(1),window.scrollTo({top:0,behavior:"smooth"})}:void 0},z.id)]}):e.jsxs("div",{className:"card mt-5 p-8 text-center text-muted",children:["No questions match these filters",k==="wrong"?" — no wrong answers to review. 🎉":"."]}):e.jsx("div",{className:"card mt-5 p-8 text-center",children:ye?e.jsx("p",{className:"text-bad",children:"Could not load the questions. Check your connection and reload the page."}):e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"font-semibold text-ink",children:"Loading the question bank…"}),e.jsx("div",{className:"mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-raised",children:e.jsx("div",{className:"h-full rounded-full bg-indigo transition-all",style:{width:`${Math.round(ge*100)}%`}})})]})})]})}function D({label:o,hint:r,children:l}){return e.jsxs("div",{children:[e.jsxs("p",{className:"mb-1 text-[11px] font-bold uppercase tracking-wide text-muted",children:[o,r&&e.jsxs("span",{className:"ml-1 font-normal normal-case tracking-normal text-faint",children:["· ",r]})]}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:l})]})}function x({on:o,onClick:r,children:l,cls:i}){return e.jsx("button",{type:"button","aria-pressed":o,onClick:r,className:`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${o?`${i??"bg-ink"} border-transparent text-white`:"border-line bg-surface text-ink hover:border-indigo/50"}`,children:l})}function Je({q:o,onNext:r}){const l=B(p=>{var n;return(n=p.solvedTries)==null?void 0:n[o.id]}),i=B(p=>p.recordSolved),[d,u]=h.useState(null),[g,m]=h.useState(!1),[w,c]=h.useState(!1),P=ne(),b=me[o.phase],v=d!==null||w,k=p=>{d===null&&(u(p),i(o.id,p,p===o.answer))};return h.useEffect(()=>{const p=n=>{var _;const C=(_=n.target)==null?void 0:_.tagName;if(C==="INPUT"||C==="TEXTAREA")return;const y="1234".indexOf(n.key)>=0?"1234".indexOf(n.key):"abcd".indexOf(n.key.toLowerCase());y>=0&&y<o.options.length&&n.key.length===1?k(y):n.key==="ArrowRight"&&v&&r&&r()};return window.addEventListener("keydown",p),()=>window.removeEventListener("keydown",p)}),e.jsxs("article",{className:"card mt-3 overflow-hidden",children:[e.jsxs("div",{className:`flex flex-wrap items-center gap-2 border-b border-line ${b.soft} px-4 py-2.5 text-xs sm:px-6`,children:[e.jsx("span",{className:`rounded-md ${b.bg} px-2 py-0.5 font-bold text-white`,children:ce[o.phase-1].name}),o.focus?e.jsxs("span",{className:"chip bg-amber/15 font-bold text-amber",children:[e.jsx(Q,{size:12})," Must-know"]}):e.jsxs("span",{className:"chip bg-surface text-muted",children:[e.jsx(G,{size:12})," Practice"]}),e.jsxs("span",{className:"chip bg-surface text-muted",children:["Syllabus ",o.topic]}),o.bookRef&&e.jsxs("span",{className:"chip bg-surface text-muted",children:[e.jsx(he,{size:12})," ",o.bookRef]}),e.jsx("span",{className:"chip bg-surface text-ink",children:U[o.qtype]}),e.jsx("span",{className:`chip ${K[o.difficulty][1]}`,children:K[o.difficulty][0]}),l&&d===null&&e.jsxs("span",{className:`ml-auto chip ${l.ok?"bg-good/10 text-good":"bg-bad/10 text-bad"}`,children:["Last time: ",l.ok?"correct":`chose ${L[l.pick]}`]})]}),e.jsxs("div",{className:"p-4 sm:p-6",children:[e.jsx("div",{className:"solved-md text-[16px] leading-relaxed text-ink",children:e.jsx(S,{children:o.stem})}),o.figure&&e.jsx(qe,{f:o.figure}),e.jsx("div",{className:"mt-4 grid gap-2.5",role:"radiogroup","aria-label":"Answer options",children:o.options.map((p,n)=>{const C=d===n,y=o.answer===n;let _="border-line bg-surface hover:border-indigo/50 hover:bg-indigo/5";return v&&y&&(_="border-good bg-good/10"),v&&C&&!y&&(_="border-bad bg-bad/10"),e.jsxs("button",{type:"button",role:"radio","aria-checked":C,onClick:()=>k(n),className:`flex w-full items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left text-[15px] transition ${_}`,children:[e.jsx("span",{className:`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-bold ${v&&y?"bg-good text-white":v&&C?"bg-bad text-white":"bg-raised text-muted"}`,children:L[n]}),e.jsx("span",{className:"solved-md min-w-0 flex-1 pt-0.5",children:e.jsx(S,{children:p})}),v&&y&&e.jsx(Y,{className:"mt-0.5 shrink-0 text-good",size:20}),v&&C&&!y&&e.jsx(oe,{className:"mt-0.5 shrink-0 text-bad",size:20})]},n)})}),!v&&e.jsxs("div",{className:"mt-4 flex flex-wrap items-center gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>m(p=>!p),className:"btn-outline px-3 py-2 text-sm",children:[e.jsx(Ae,{size:15,className:"text-amber"})," ",g?"Hide hint":"Hint (formula only)"]}),e.jsxs("button",{type:"button",onClick:()=>c(!0),className:"ml-auto inline-flex items-center gap-1 text-xs font-semibold text-faint hover:text-muted",children:[e.jsx(Pe,{size:13})," Show solution without answering"]})]}),e.jsx(re,{children:g&&!v&&e.jsx(W.div,{initial:P?!1:{opacity:0,height:0},animate:{opacity:1,height:"auto"},exit:{opacity:0,height:0},className:"overflow-hidden",children:e.jsx("div",{className:"solved-md mt-3 rounded-xl bg-amber/10 px-4 py-3 text-[15px] text-ink",children:e.jsx(S,{children:o.hint})})})}),v&&e.jsxs(W.section,{initial:P?!1:{opacity:0,y:10},animate:{opacity:1,y:0},className:"mt-5","aria-label":"Solution",children:[d!==null&&e.jsx("div",{className:`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 font-display text-lg font-bold ${d===o.answer?"bg-good/10 text-good":"bg-bad/10 text-bad"}`,children:d===o.answer?e.jsxs(e.Fragment,{children:[e.jsx(Y,{size:22})," Correct!"]}):e.jsxs(e.Fragment,{children:[e.jsx(oe,{size:22})," Not quite — the answer is ",L[o.answer]]})}),e.jsx("h3",{className:"font-display text-base font-bold text-ink",children:"Step-by-step solution"}),e.jsx("ol",{className:"mt-3 space-y-3",children:o.steps.map((p,n)=>e.jsxs(W.li,{initial:P?!1:{opacity:0,x:-8},animate:{opacity:1,x:0},transition:{delay:P?0:.12*n},className:"flex gap-2.5 rounded-xl border border-line bg-surface p-3 sm:gap-3 sm:p-3.5",children:[e.jsx("span",{className:`grid h-7 w-7 shrink-0 place-items-center rounded-full ${b.bg} font-mono text-xs font-bold text-white`,children:n+1}),e.jsxs("div",{className:"solved-md min-w-0 flex-1",children:[e.jsx("p",{className:"font-semibold text-ink",children:p.title}),e.jsx("div",{className:"mt-1 text-[15px] leading-relaxed text-ink",children:e.jsx(S,{children:p.body})})]})]},n))}),e.jsx("div",{className:"solved-md mt-4 rounded-xl bg-indigo/10 px-4 py-3 text-[15px] font-semibold text-ink",children:e.jsx(S,{children:o.final})}),e.jsx("h3",{className:"mt-5 font-display text-base font-bold text-ink",children:"Why the other options are wrong"}),e.jsx("ul",{className:"mt-2 space-y-2",children:o.options.map((p,n)=>n===o.answer?null:e.jsxs("li",{className:`solved-md flex gap-2 rounded-lg px-3 py-2 text-sm ${d===n?"bg-bad/10":"bg-raised/60"}`,children:[e.jsx("span",{className:"font-bold text-bad",children:L[n]}),e.jsx("div",{className:"min-w-0 flex-1 text-ink",children:e.jsx(S,{children:o.whyWrong[n]||"—"})})]},n))}),o.trap&&e.jsxs("div",{className:"solved-md mt-4 flex gap-2 rounded-xl bg-coral/10 px-4 py-3 text-sm text-ink",children:[e.jsx(_e,{size:17,className:"mt-0.5 shrink-0 text-coral"}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("b",{children:"Exam trap: "}),e.jsx(S,{children:o.trap})]})]}),e.jsx(et,{topic:o.topic,openInitially:d!==null&&d!==o.answer,accent:b}),e.jsxs("div",{className:"mt-5 flex flex-wrap gap-2",children:[e.jsxs("button",{type:"button",className:"btn-outline px-4 py-2.5",onClick:()=>{u(null),c(!1),m(!1)},children:[e.jsx(Ie,{size:15})," Try again"]}),r&&e.jsxs("button",{type:"button",className:"btn-primary ml-auto px-5 py-2.5",onClick:r,children:["Next question ",e.jsx(de,{size:16})]})]})]})]})]})}function et({topic:o,openInitially:r,accent:l}){const i=Ze[o],[d,u]=h.useState(r),g=ne();if(!i)return null;const m=Re[o];return e.jsxs("section",{className:`mt-5 overflow-hidden rounded-2xl border-2 ${d?"border-indigo/40":"border-line"} bg-surface`,children:[e.jsxs("button",{type:"button",onClick:()=>u(w=>!w),"aria-expanded":d,className:`flex w-full items-center gap-3 px-4 py-3.5 text-left ${l.soft}`,children:[e.jsx("span",{className:`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${l.bg} text-white`,children:e.jsx(se,{size:18})}),e.jsxs("span",{className:"min-w-0 flex-1",children:[e.jsxs("span",{className:"block text-xs font-semibold uppercase tracking-wide text-muted",children:["Study the lesson · ",i.pages]}),e.jsxs("span",{className:"block font-display text-base font-bold text-ink",children:[o," ",i.title]})]}),e.jsx(le,{size:20,className:`shrink-0 text-muted transition ${d?"rotate-180":""}`})]}),e.jsx(re,{initial:!1,children:d&&e.jsx(W.div,{initial:g?!1:{height:0,opacity:0},animate:{height:"auto",opacity:1},exit:{height:0,opacity:0},className:"overflow-hidden",children:e.jsxs("div",{className:"solved-md space-y-4 px-4 pb-5 pt-4 sm:px-6",children:[e.jsx("div",{className:"text-[15.5px] leading-relaxed text-ink",children:e.jsx(S,{children:i.intro})}),i.sections.map((w,c)=>e.jsxs("div",{children:[e.jsxs("h4",{className:"font-display text-[15px] font-bold text-ink",children:[e.jsxs("span",{className:"mr-1.5 font-mono text-xs text-muted",children:[c+1,"."]}),w.heading]}),e.jsx("div",{className:"mt-1.5 text-[15px] leading-relaxed text-ink",children:e.jsx(S,{children:w.body})})]},c)),e.jsxs("div",{className:"rounded-xl bg-amber/10 p-4",children:[e.jsxs("p",{className:"flex items-center gap-1.5 font-display text-sm font-bold text-ink",children:[e.jsx(Q,{size:15,className:"text-amber"})," Must remember"]}),e.jsx("ul",{className:"mt-2 space-y-1.5 text-[14.5px] text-ink",children:i.keyPoints.map((w,c)=>e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"text-amber",children:"•"}),e.jsx("div",{className:"min-w-0 flex-1",children:e.jsx(S,{children:w})})]},c))})]}),e.jsxs("div",{className:"rounded-xl bg-coral/10 p-4",children:[e.jsxs("p",{className:"flex items-center gap-1.5 font-display text-sm font-bold text-ink",children:[e.jsx(G,{size:15,className:"text-coral"})," How the exam tests it"]}),e.jsx("ul",{className:"mt-2 space-y-1.5 text-[14.5px] text-ink",children:i.examTips.map((w,c)=>e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"text-coral",children:"•"}),e.jsx("div",{className:"min-w-0 flex-1",children:e.jsx(S,{children:w})})]},c))})]}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[i.doc&&i.pdfPage!=null&&e.jsxs(ie,{to:`/library?doc=${i.doc}&page=${i.pdfPage}`,className:"btn-outline px-3 py-2 text-sm",children:[e.jsx(he,{size:15})," Open in the book (",i.pages.replace(/^Book /,""),")"]}),m&&e.jsxs(ie,{to:`/lessons/${o}`,className:"btn-outline px-3 py-2 text-sm",children:[e.jsx(se,{size:15})," Full academy lesson"]})]})]})})})]})}export{nt as default};
