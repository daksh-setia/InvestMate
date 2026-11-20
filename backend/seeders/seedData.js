/**
 * INVESTMATE - Verified Sample Government Scheme Seed Data
 * All data sourced from official Government of India portals (.gov.in)
 * Clearly labeled and fact-checked for rural citizens, farmers, elderly, and frontline workers.
 */

const categoriesData = [
  {
    name: 'Agriculture',
    slug: 'agriculture',
    description: 'Income support, crop assistance, and sustainable livelihoods for farmers and small landholders.',
    icon: 'seedling',
    targetAudience: ['Small & Marginal Farmers', 'Agricultural Laborers', 'Rural Households'],
    displayOrder: 1
  },
  {
    name: 'Health',
    slug: 'health',
    description: 'Cashless hospitalization, maternal health support, and medical insurance coverage for families.',
    icon: 'heart-pulse',
    targetAudience: ['Rural Families', 'Senior Citizens', 'ASHA & Anganwadi Workers', 'Low-Income Groups'],
    displayOrder: 2
  },
  {
    name: 'Pension',
    slug: 'pension',
    description: 'Guaranteed monthly old-age pensions and social security for unorganized workers and elderly citizens.',
    icon: 'person-cane',
    targetAudience: ['Elderly Citizens', 'Unorganized Sector Workers', 'Farmers', 'Frontline Workers'],
    displayOrder: 3
  },
  {
    name: 'Social Welfare',
    slug: 'social-welfare',
    description: 'Affordable accidental and life insurance coverage protecting families from sudden emergencies.',
    icon: 'shield-halved',
    targetAudience: ['All Indian Citizens', 'Rural Households', 'BPL Families'],
    displayOrder: 4
  },
  {
    name: 'Education',
    slug: 'education',
    description: 'Financial security and educational empowerment for the girl child and rural students.',
    icon: 'graduation-cap',
    targetAudience: ['Girl Children & Parents', 'Students', 'Rural Youth'],
    displayOrder: 5
  }
];

const usersData = [
  {
    fullName: 'Investmate Admin Officer',
    email: 'admin@investmate.gov.in',
    password: 'Admin@Secure123',
    preferredLanguage: 'en',
    role: 'admin'
  },
  {
    fullName: 'Citizen User (Nagrik)',
    email: 'citizen@investmate.gov.in',
    password: 'Citizen@Secure123',
    preferredLanguage: 'hi',
    role: 'user'
  },
  {
    fullName: 'Ramesh Kumar (Farmer)',
    email: 'farmer.ramesh@investmate.in',
    password: 'Farmer@Ramesh123',
    preferredLanguage: 'hi',
    role: 'user'
  },
  {
    fullName: 'Sunita Devi (ASHA Facilitator)',
    email: 'asha.sunita@investmate.in',
    password: 'Sunita@Asha123',
    preferredLanguage: 'hi',
    role: 'user'
  }
];

const schemesData = [
  {
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    categorySlug: 'agriculture',
    shortDescription: 'Direct income support of ₹6,000 per year transferred in three equal installments of ₹2,000 to landholding farmer families.',
    detailedExplanation: 'PM-KISAN is an income support scheme launched by the Government of India for landholding farmer families across the country. Under this scheme, financial assistance of ₹6,000 per year is provided in three equal 4-monthly installments directly into the Aadhaar-seeded bank accounts of eligible farmers through Direct Benefit Transfer (DBT). There is zero intermediary involvement.',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: null,
      targetOccupations: ['Small Farmer', 'Marginal Farmer', 'Landholding Cultivator'],
      incomeLimit: 'Institutional landholders and income-tax payers are excluded',
      gender: 'All',
      residence: 'Resident Indian Citizen',
      rules: [
        'Must own cultivable land in their own name as per land revenue records.',
        'Institutional landholders and constitutional post holders are not eligible.',
        'Beneficiary family must have an Aadhaar-seeded bank account.',
        'Mandatory completion of e-KYC on the PM-KISAN portal or via biometric CSC.'
      ]
    },
    benefits: [
      '₹6,000 annually paid directly into the beneficiary bank account.',
      'Paid in 3 equal installments of ₹2,000 every 4 months (April-July, August-November, December-March).',
      '100% centrally sponsored scheme with zero deduction or commission.'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Land Ownership Record (Khatauni / Khasra document)',
      'Aadhaar-linked Bank Account Passbook',
      'Active Mobile Number for OTP verification'
    ],
    applicationProcedure: {
      mode: 'Both',
      steps: [
        'Visit the official PM-KISAN portal (pmkisan.gov.in) or visit your nearest Common Service Centre (CSC).',
        'Click on "New Farmer Registration" and enter your Aadhaar Number and State.',
        'Fill in land record details (District, Sub-District, Block, Village, Survey/Khatauni number).',
        'Upload supporting land record documents and submit.',
        'Complete biometric or OTP-based e-KYC.'
      ],
      whereToApply: 'pmkisan.gov.in or any authorized Village CSC / Krishi Bhavan',
      officialHelpline: '155261 / 011-24300606 (Toll Free)',
      processingFees: '₹0 (Free on portal; standard CSC nominal processing fee of max ₹15 apply)'
    },
    officialPortalUrl: 'https://pmkisan.gov.in/',
    status: 'Active',
    finePrint: {
      lockInPeriod: 'No lock-in period. Benefits continue as long as eligibility conditions are met.',
      exitPenalties: 'No exit penalty. If land is transferred, eligibility moves with verified revenue records.',
      hiddenCharges: 'Zero hidden charges. Complete DBT transfer of full ₹2,000 per installment.',
      withdrawalConditions: 'Direct bank credit. No minimum balance restrictions imposed by RBI on DBT accounts.',
      expectedReturns: '₹6,000 fixed annual welfare grant. Not an investment scheme.',
      inflationAdjustedReturns: 'Information not verified (Grant amount fixed by Union Cabinet).',
      importantWarnings: [
        'Do NOT pay money to any middleman or unauthorized broker promising fast-track approval.',
        'e-KYC is mandatory; failure to complete e-KYC will temporarily pause installment credit.',
        'Income-tax payees in the previous assessment year are legally ineligible.'
      ],
      isVerified: true,
      verificationSource: 'Ministry of Agriculture & Farmers Welfare, Govt of India (pmkisan.gov.in)'
    },
    tags: ['farmer', 'agriculture', 'dbt', 'income-support', 'kisan']
  },
  {
    name: 'Ayushman Bharat PM-JAY (Jan Arogya Yojana)',
    categorySlug: 'health',
    shortDescription: 'Cashless medical treatment and hospitalization cover of up to ₹5 Lakh per year per family, including all senior citizens aged 70+.',
    detailedExplanation: 'Ayushman Bharat PM-JAY is the world’s largest government-funded health assurance scheme. It provides a health cover of ₹5,00,000 per family per year for secondary and tertiary care hospitalization across all impaneled public and private hospitals. Treatment is completely cashless and paperless at the point of service. In 2024, the Union Cabinet expanded PM-JAY to cover all senior citizens aged 70 and above, regardless of family income.',
    eligibilityCriteria: {
      minAge: null,
      maxAge: null,
      targetOccupations: ['Rural Families', 'ASHA Workers', 'Anganwadi Workers', 'Unorganized Workers', 'Senior Citizens 70+'],
      incomeLimit: 'Identified via SECC 2011 rural deprivation criteria; All citizens 70+ eligible regardless of income',
      gender: 'All',
      residence: 'Resident of India',
      rules: [
        'Families categorized under rural deprivation criteria (D1-D7) under SECC 2011.',
        'All active ASHA and Anganwadi workers and helpers are covered.',
        'Every Indian citizen aged 70 or above is eligible for the distinct Ayushman Vay Vandana Card.',
        'No restriction on family size, age, or gender.'
      ]
    },
    benefits: [
      'Up to ₹5,00,000 per family per year for medical treatment and surgeries.',
      'Covers 3 days of pre-hospitalization and 15 days of post-hospitalization expenses.',
      'Covers ~1,949 medical and surgical procedures across empanelled hospitals pan-India.',
      'Pre-existing health conditions are covered from day one.'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Ration Card / Family ID document',
      'Mobile Number'
    ],
    applicationProcedure: {
      mode: 'Both',
      steps: [
        'Check your eligibility on beneficiary.nha.gov.in using your Aadhaar or Ration card number.',
        'Visit any empanelled Government or Private Hospital and meet the "Ayushman Mitra" desk.',
        'Provide Aadhaar card for biometric/e-KYC authentication.',
        'Receive the printed or digital Ayushman Card instantly.'
      ],
      whereToApply: 'beneficiary.nha.gov.in, nearest Ayushman Arogya Mandir, or empanelled hospital',
      officialHelpline: '14555 (National Health Authority Toll Free)',
      processingFees: '₹0 (Completely Free of cost)'
    },
    officialPortalUrl: 'https://pmjay.gov.in/',
    status: 'Active',
    finePrint: {
      lockInPeriod: 'No lock-in period. Card remains active as long as the scheme is funded.',
      exitPenalties: 'No exit penalty.',
      hiddenCharges: 'Zero charges. Hospitals are strictly prohibited from charging patients for covered packages.',
      withdrawalConditions: 'Non-cash benefit. Claims are settled directly between Government and hospital.',
      expectedReturns: 'N/A - Comprehensive healthcare assurance, not an investment product.',
      inflationAdjustedReturns: 'Information not verified',
      importantWarnings: [
        'Hospitals cannot ask for advance cash deposit for treatments covered under Ayushman Bharat.',
        'Report any hospital demanding cash payment to the 14555 national grievance helpline immediately.',
        'OPD (general doctor consultation without admission) is handled at Ayushman Arogya Mandir, not hospital admission.'
      ],
      isVerified: true,
      verificationSource: 'National Health Authority (NHA), Ministry of Health and Family Welfare (pmjay.gov.in)'
    },
    tags: ['health', 'hospitalization', 'ayushman', 'asha', 'senior-citizens', 'free-treatment']
  },
  {
    name: 'Atal Pension Yojana (APY)',
    categorySlug: 'pension',
    shortDescription: 'Guaranteed government monthly pension of ₹1,000 to ₹5,000 after age 60 for unorganized workers and rural citizens.',
    detailedExplanation: 'Atal Pension Yojana is a flagship social security pension scheme administered by the Pension Fund Regulatory and Development Authority (PFRDA). Open to Indian citizens between 18 and 40 years of age, it provides a guaranteed minimum lifetime monthly pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000, or ₹5,000 after reaching age 60, depending on the subscriber’s contribution amount and joining age.',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 40,
      targetOccupations: ['Unorganized Workers', 'Farmers', 'Daily Wage Earners', 'Domestic Workers', 'Small Business Owners'],
      incomeLimit: 'From Oct 1, 2022, income-tax payers are not eligible to join',
      gender: 'All',
      residence: 'Indian Citizen',
      rules: [
        'Must be between 18 and 40 years of age at the time of enrollment.',
        'Must hold an active savings bank account or Post Office savings account.',
        'Must not be an income-tax payer.',
        'Contributions must be maintained until reaching age 60.'
      ]
    },
    benefits: [
      'Guaranteed lifelong monthly pension of ₹1,000 to ₹5,000 after completing age 60.',
      'Upon subscriber death, the same pension amount continues to the spouse for life.',
      'Upon demise of both subscriber and spouse, the entire accumulated pension wealth is returned to the nominee.'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Savings Bank Account Passbook',
      'Nominee details (Aadhaar & relationship proof)',
      'Registered Mobile Number'
    ],
    applicationProcedure: {
      mode: 'Both',
      steps: [
        'Approach the bank branch or Post Office where you maintain your savings account.',
        'Fill the APY registration form with desired pension tier (₹1,000 to ₹5,000) and auto-debit frequency.',
        'Provide Aadhaar and spouse/nominee details.',
        'Ensure sufficient balance in bank account on the chosen auto-debit date each month.'
      ],
      whereToApply: 'Any Public/Private Bank Branch, Post Office, or NetBanking APY portal',
      officialHelpline: '1800-110-069 (PFRDA Toll Free)',
      processingFees: '₹0 enrollment fee'
    },
    officialPortalUrl: 'https://www.npscra.nsdl.co.in/',
    status: 'Active',
    finePrint: {
      lockInPeriod: 'Lock-in until the subscriber attains 60 years of age.',
      exitPenalties: 'Premature exit before 60 is permitted only under exceptional circumstances (terminal illness or demise). In voluntary early exit, only subscriber contribution and net actual returns are refunded; government co-contribution and interest are forfeited.',
      hiddenCharges: 'Overdue interest of ₹1 per month for contribution up to ₹100; ₹2 up to ₹500; ₹5 up to ₹1000; ₹10 above ₹1000 for delayed monthly debit.',
      withdrawalConditions: 'Full regular monthly pension disbursement begins strictly upon completion of 60 years.',
      expectedReturns: 'Guaranteed minimum return backing by Govt of India ensuring chosen pension tier (₹1,000-₹5,000/mo). If actual market returns exceed statutory minimum, higher returns are passed to subscriber.',
      inflationAdjustedReturns: 'Information not verified (Statutory pension amount is fixed in rupee terms and not automatically indexed to CPI inflation).',
      importantWarnings: [
        'Keep sufficient funds in your bank account on auto-debit dates to prevent auto-debit failure charges.',
        'If contributions remain discontinuous for 6 months, account may be frozen; after 24 months, account can be deactivated.'
      ],
      isVerified: true,
      verificationSource: 'PFRDA / Ministry of Finance, Government of India (pfrda.org.in)'
    },
    tags: ['pension', 'old-age', 'retirement', 'social-security', 'unorganized']
  },
  {
    name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    categorySlug: 'social-welfare',
    shortDescription: 'Accidental death and disability insurance cover of ₹2 Lakh for an affordable premium of only ₹20 per year.',
    detailedExplanation: 'PMSBY is a government-backed accident insurance scheme for Indian citizens aged 18 to 70 years. For an annual premium of just ₹20 auto-debited once a year from the beneficiary’s bank account, it provides ₹2,00,000 for accidental death or total permanent disability, and ₹1,00,000 for partial permanent disability.',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 70,
      targetOccupations: ['All Citizens', 'Rural Families', 'Laborers', 'Drivers', 'Farmers'],
      incomeLimit: 'No income criteria',
      gender: 'All',
      residence: 'Indian Citizen with Bank / Post Office Account',
      rules: [
        'Age between 18 and 70 years.',
        'Hold an active bank account with auto-debit consent enabled.',
        'Only one PMSBY policy per person, regardless of how many bank accounts are held.'
      ]
    },
    benefits: [
      '₹2,00,000 payable to nominee in the event of accidental death.',
      '₹2,00,000 for total and irrecoverable loss of both eyes or loss of use of both hands or feet.',
      '₹1,00,000 for loss of one eye or loss of use of one hand or foot.'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Bank Account Passbook with ECS / Auto-debit authorization',
      'Nominee details'
    ],
    applicationProcedure: {
      mode: 'Both',
      steps: [
        'Visit your bank branch or log in to your mobile banking / net banking application.',
        'Submit the one-page PMSBY consent-cum-declaration form.',
        'Enable auto-debit consent for ₹20 annually (deducted before May 31 each year).'
      ],
      whereToApply: 'Your bank branch, Post Office, or NetBanking',
      officialHelpline: '1800-180-1111 (National Toll-free)',
      processingFees: '₹20 annual insurance premium'
    },
    officialPortalUrl: 'https://www.jansuraksha.gov.in/',
    status: 'Active',
    finePrint: {
      lockInPeriod: 'Annual renewable contract (June 1 to May 31).',
      exitPenalties: 'None. Policy terminates automatically if bank balance is insufficient on the deduction date.',
      hiddenCharges: 'Zero hidden fees. Full ₹20 goes directly towards risk premium and administration.',
      withdrawalConditions: 'Pure term accident insurance; no maturity value or surrender benefit is payable if no accident occurs.',
      expectedReturns: 'N/A - Pure risk insurance coverage.',
      inflationAdjustedReturns: 'Information not verified',
      importantWarnings: [
        'Natural death (illness, heart attack, old age) is NOT covered under PMSBY; it covers accidental death only.',
        'Ensure minimum ₹20 balance in bank account in the month of May every year to avoid insurance lapse.'
      ],
      isVerified: true,
      verificationSource: 'Department of Financial Services, Ministry of Finance (jansuraksha.gov.in)'
    },
    tags: ['insurance', 'accident', 'low-cost', 'safety-net', 'jansuraksha']
  },
  {
    name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
    categorySlug: 'social-welfare',
    shortDescription: 'Life insurance cover of ₹2 Lakh for death due to any reason for an annual premium of ₹436.',
    detailedExplanation: 'PMJJBY offers renewable one-year term life cover of ₹2,00,000 to citizens aged 18 to 50 years with a bank account. It covers death due to any cause (including medical illnesses, natural death, or accident). Premium is ₹436 per year, auto-debited in a single installment from the subscriber’s bank account.',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 50,
      targetOccupations: ['All citizens', 'Rural breadwinners', 'Informal workers', 'Farmers'],
      incomeLimit: 'No income criteria',
      gender: 'All',
      residence: 'Indian Citizen',
      rules: [
        'Individual must be between 18 and 50 years of age.',
        'Must hold a savings bank account with consent for annual auto-debit.',
        'Can continue coverage up to age 55 provided annual renewal is maintained.'
      ]
    },
    benefits: [
      '₹2,00,000 sum assured paid to the nominated family member in case of death due to ANY reason.',
      'High peace of mind for rural breadwinners at ~₹1.20 per day.'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Bank Account Passbook',
      'Nominee identification and bank details'
    ],
    applicationProcedure: {
      mode: 'Both',
      steps: [
        'Visit your savings bank branch or use Internet Banking.',
        'Fill PMJJBY registration form declaring good health.',
        'Consent to auto-debit of ₹436 from bank account in May.'
      ],
      whereToApply: 'Empanelled banks and Post Offices',
      officialHelpline: '1800-180-1111',
      processingFees: '₹436 annual premium'
    },
    officialPortalUrl: 'https://www.jansuraksha.gov.in/',
    status: 'Active',
    finePrint: {
      lockInPeriod: 'Annual renewable term cover (1st June to 31st May).',
      exitPenalties: 'None. Non-renewal causes policy lapse.',
      hiddenCharges: 'Zero hidden charges.',
      withdrawalConditions: 'Pure term life insurance; no savings or maturity payout if subscriber survives.',
      expectedReturns: 'N/A - Term life protection.',
      inflationAdjustedReturns: 'Information not verified',
      importantWarnings: [
        'Initial 30-day lien period applies for deaths other than accidents after new enrollment.',
        'Can be held through only one bank account per person.'
      ],
      isVerified: true,
      verificationSource: 'Department of Financial Services, Ministry of Finance (jansuraksha.gov.in)'
    },
    tags: ['life-insurance', 'term-insurance', 'family-security', 'jansuraksha']
  },
  {
    name: 'Sukanya Samriddhi Yojana (SSY)',
    categorySlug: 'education',
    shortDescription: 'High-interest sovereign savings scheme for the girl child offering 8.2% annual interest and complete tax exemption.',
    detailedExplanation: 'Sukanya Samriddhi Yojana is a small deposit scheme by the Government of India launched under the "Beti Bachao Beti Padhao" campaign to build a dedicated fund for a girl child’s higher education and marriage. An account can be opened in the name of a girl child from her birth until she turns 10 years old. It currently offers one of the highest government-backed interest rates (8.2% p.a.).',
    eligibilityCriteria: {
      minAge: 0,
      maxAge: 10,
      targetOccupations: ['Parents / Legal Guardians of Girl Child'],
      incomeLimit: 'No income criteria',
      gender: 'Female',
      residence: 'Resident Indian Girl Child',
      rules: [
        'Girl child must be an Indian resident under 10 years old at account opening.',
        'Maximum 2 accounts per family (one for each girl child, exception for twins/triplets).',
        'Minimum initial deposit of ₹250 and minimum ₹250 deposit per financial year.'
      ]
    },
    benefits: [
      'Attractive government-guaranteed interest rate of 8.2% per annum (compounded annually).',
      'Exempt-Exempt-Exempt (EEE) tax status under Income Tax Act.',
      'Partial withdrawal up to 50% of the balance permitted for higher education once the girl turns 18 or completes 10th standard.'
    ],
    requiredDocuments: [
      'Girl Child’s Birth Certificate',
      'Parent / Guardian Aadhaar Card & PAN Card',
      'Address Proof (Electricity bill / Ration card)',
      'Passport size photographs of parent & child'
    ],
    applicationProcedure: {
      mode: 'Offline',
      steps: [
        'Visit nearest Post Office or authorized commercial bank branch.',
        'Fill Form-1 (Sukanya Samriddhi Account Opening Form).',
        'Attach birth certificate of the girl child and KYC documents of parent.',
        'Deposit initial opening amount (minimum ₹250 in cash/cheque).'
      ],
      whereToApply: 'India Post offices and authorized public/private commercial banks',
      officialHelpline: '1800-266-6868 (India Post Toll Free)',
      processingFees: '₹0 (No account opening fee)'
    },
    officialPortalUrl: 'https://www.indiapost.gov.in/',
    status: 'Active',
    finePrint: {
      lockInPeriod: 'Account matures 21 years from the date of account opening, or upon marriage of the girl child after she turns 18.',
      exitPenalties: 'Premature closure permitted only after 5 years on grounds of death of guardian/child or medical emergencies with documentary proof.',
      hiddenCharges: 'Penalty of ₹50 per year if minimum ₹250 is not deposited in any financial year.',
      withdrawalConditions: 'Maximum 50% withdrawal allowed after age 18 for educational expenses. Full balance payout strictly to the girl child upon maturity.',
      expectedReturns: '8.2% per annum fixed by Ministry of Finance (subject to quarterly sovereign review).',
      inflationAdjustedReturns: '~2.8% estimated real return based on historical 5.4% CPI benchmark.',
      importantWarnings: [
        'Deposits can only be made for the first 15 years from the date of account opening.',
        'The girl child herself must operate the account once she reaches 18 years of age.'
      ],
      isVerified: true,
      verificationSource: 'National Savings Institute / Ministry of Finance (nsiindia.gov.in)'
    },
    tags: ['education', 'girl-child', 'savings', 'sukanya', 'high-interest']
  },
  {
    name: 'Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)',
    categorySlug: 'pension',
    shortDescription: 'Old-age pension scheme for unorganized workers and ASHA/Anganwadi workers offering ₹3,000 guaranteed monthly pension.',
    detailedExplanation: 'PM-SYM is a central government pension scheme tailored for unorganized workers, home-based workers, street vendors, agricultural laborers, domestic servants, and frontline workers (ASHA and Anganwadi). The subscriber makes a monthly contribution between ₹55 and ₹200 (depending on entry age), and the Central Government makes an equal 50% matching contribution.',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 40,
      targetOccupations: ['ASHA Worker', 'Anganwadi Worker', 'Agricultural Laborer', 'Construction Worker', 'Domestic Worker', 'Street Vendor'],
      incomeLimit: 'Monthly income must be ₹15,000 or less',
      gender: 'All',
      residence: 'Indian Citizen',
      rules: [
        'Must be working in the unorganized sector.',
        'Entry age must be between 18 and 40 years.',
        'Monthly income should not exceed ₹15,000.',
        'Must not be covered under EPFO, ESIC, or NPS.'
      ]
    },
    benefits: [
      'Guaranteed minimum monthly pension of ₹3,000 after attaining 60 years.',
      'Equal 50% matching monthly contribution deposited by the Central Government.',
      'Spousal family pension of 50% (₹1,500/month) if beneficiary passes away during pension receipt.'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Savings Bank Account Passbook or Jan Dhan Account details',
      'Mobile Number'
    ],
    applicationProcedure: {
      mode: 'Both',
      steps: [
        'Visit nearest Common Service Centre (CSC) with Aadhaar and Bank Passbook.',
        'CSC operator calculates initial monthly installment based on age.',
        'Pay first contribution in cash at CSC; system generates Shram Yogi Pension Card.',
        'Subsequent contributions are debited automatically from bank account.'
      ],
      whereToApply: 'maandhan.in or any Village CSC / LIC Branch',
      officialHelpline: '1800-267-6888 (Toll Free)',
      processingFees: '₹0 (CSC enrollment paid by Government)'
    },
    officialPortalUrl: 'https://maandhan.in/',
    status: 'Active',
    finePrint: {
      lockInPeriod: 'Contributions continue until subscriber reaches 60 years of age.',
      exitPenalties: 'If exiting within 10 years, only beneficiary share of contribution is refunded with savings bank interest rate.',
      hiddenCharges: 'Zero hidden administrative charges.',
      withdrawalConditions: 'Regular monthly pension of ₹3,000 starts on the month following completion of age 60.',
      expectedReturns: 'Guaranteed ₹3,000 monthly pension backed by LIC of India and Central Government.',
      inflationAdjustedReturns: 'Information not verified',
      importantWarnings: [
        'If beneficiary enters organized sector (EPFO) later, they can exit or continue under separate guidelines.',
        'Keep bank balance sufficient for auto-debit.'
      ],
      isVerified: true,
      verificationSource: 'Ministry of Labour and Employment, Govt of India (maandhan.in)'
    },
    tags: ['pension', 'unorganized', 'asha', 'anganwadi', 'frontline-workers', 'maan-dhan']
  },
  {
    name: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
    categorySlug: 'pension',
    shortDescription: 'Monthly financial assistance and old-age social security pension for destitute senior citizens living Below Poverty Line (BPL).',
    detailedExplanation: 'IGNOAPS is a non-contributory pension scheme under the National Social Assistance Programme (NSAP) for elderly Indian citizens aged 60 and above living below the poverty line. Eligible beneficiaries receive monthly financial assistance directly into their bank accounts to sustain daily livelihood needs without depending on others.',
    eligibilityCriteria: {
      minAge: 60,
      maxAge: null,
      targetOccupations: ['Elderly Citizens', 'Destitute Senior Citizens', 'Rural BPL Households'],
      incomeLimit: 'Must belong to Below Poverty Line (BPL) household',
      gender: 'All',
      residence: 'Indian Citizen',
      rules: [
        'Age must be 60 years or above.',
        'Must possess a valid BPL card or be registered in the BPL census.',
        'Non-contributory; no payments required from beneficiary.'
      ]
    },
    benefits: [
      'Monthly direct cash assistance (combined Central + State contribution typically ₹1,000 to ₹2,500/month depending on state).',
      'Higher rate of pension for super-senior citizens aged 80 and above.',
      '100% non-contributory grant paid directly via DBT.'
    ],
    requiredDocuments: [
      'Aadhaar Card or Voter ID',
      'Age Proof (Birth Certificate, Voter ID, or Medical Board certificate)',
      'BPL Ration Card',
      'Bank Account Passbook / Post Office Account'
    ],
    applicationProcedure: {
      mode: 'Both',
      steps: [
        'Obtain NSAP application form from local Gram Panchayat or Block Development Office (BDO).',
        'Attach BPL proof, age proof, and bank passbook photocopy.',
        'Submit to the Panchayat Secretary or online on the NSAP portal (nsap.nic.in).',
        'Verification is conducted by local revenue officials.'
      ],
      whereToApply: 'nsap.nic.in or Gram Panchayat Office / Municipal Corporation',
      officialHelpline: '1800-111-555 (NSAP National Helpdesk)',
      processingFees: '₹0 (Completely Free)'
    },
    officialPortalUrl: 'https://nsap.nic.in/',
    status: 'Active',
    finePrint: {
      lockInPeriod: 'N/A - Non-contributory welfare pension.',
      exitPenalties: 'None.',
      hiddenCharges: 'Zero charges. Entire pension amount is credited to bank account.',
      withdrawalConditions: 'Withdrawable anytime from bank branch, Bank Mitra / BC point, or Micro-ATM.',
      expectedReturns: 'Monthly welfare assistance grant.',
      inflationAdjustedReturns: 'Information not verified',
      importantWarnings: [
        'Annual physical or biometric life certification (Jeevan Pramaan) is required to ensure continuous pension disbursement.',
        'Never pay fees to village intermediaries for verification.'
      ],
      isVerified: true,
      verificationSource: 'Ministry of Rural Development, Government of India (nsap.nic.in)'
    },
    tags: ['pension', 'bpl', 'elderly', 'senior-citizen', 'nsap', 'welfare']
  }
];

module.exports = {
  categoriesData,
  usersData,
  schemesData
};
