# Oman launch checklist

**This is a working checklist, not legal or tax advice.** Before public commercial launch, each
item must be re-verified against the current official sources below and confirmed by the
responsible professional. Thresholds and rates are intentionally not hard-coded in the platform:
tax settings are editable in Admin > Business settings (`business_settings` table).

Official sources to check at review time:
- Ministry of Commerce, Industry and Investment Promotion (MOCIIP): https://www.moci.gov.om
- Oman Business Platform (company registration, activities): https://www.business.gov.om
- Oman Tax Authority (VAT, e-invoicing): https://tms.taxoman.gov.om and https://taxoman.gov.om
- Consumer Protection Authority: https://www.cpa.gov.om
- Ministry of Transport, Communications and IT (personal data protection): https://www.mtcit.gov.om

Legend: ☐ to do · ◐ in progress · ☑ done. Who confirms: **L** lawyer, **A** accountant,
**B** bank, **G** government authority, **O** owner.

## 1. Company and licensing
- ☐ Commercial Registration (CR) active. (O, G)
- ☐ Licensed activities cover: selling digital products online, software/web development services
  for custom projects, and e-commerce. Confirm exact ISIC activity codes. (G, L)
- ☐ Any separate e-commerce licence/permit required for selling through a website. (G)
- ☐ Rules for selling and advertising via social media (Instagram) from Oman. (G, L)
- ☐ Ma'roof Oman (MOCIIP e-commerce trust mark): eligibility and application. (G)
- ☐ Municipality/office address requirements for a home-based or virtual business. (G)

## 2. Consumer information on the website
- ☐ Display legal name, CR number and contact details (Admin toggle `show_legal_identity`). (L)
- ☐ Clear product description, price, currency, taxes, delivery method (digital/instant) and
  access type on every product page. *Built.* (L to confirm wording)
- ☐ Terms of Service, Refund Policy and Digital Product License reviewed. *Drafts built.* (L)
- ☐ Consumer Protection Law obligations for digital goods (right of return, exceptions for
  instantly delivered digital content, complaint handling). (L)
- ☐ Arabic version of consumer-facing terms (and which language prevails). *Arabic drafts built.* (L)

## 3. Privacy and data
- ☐ Personal Data Protection Law (Royal Decree 6/2022) and its executive regulations: lawful basis,
  consent, data subject rights, breach notification, any registration/permit requirements. (L)
- ☐ Cross-border data transfer (hosting/database providers outside Oman). (L)
- ☐ Cookie/analytics consent approach. *Consent-first built.* (L)
- ☐ Data retention periods filled in the Privacy Policy. (L, A)

## 4. Tax
- ☐ VAT registration status: compare expected annual taxable supplies with the **current**
  mandatory and voluntary thresholds published by the Tax Authority. (A)
- ☐ VAT treatment of electronically supplied services to customers in Oman, other GCC states and
  outside the GCC (place of supply, B2C vs B2B). (A)
- ☐ Whether prices are shown VAT-inclusive; tax-invoice content requirements. (A)
- ☐ E-invoicing (Fawtara) obligations and timeline that apply to One Click, and the provider
  integration needed. (A, G)
- ☐ Corporate/income tax registration and record-keeping (order records retention period). (A)
- ☐ Configure `tax_enabled`, `tax_rate_percent`, `prices_include_tax` in Admin after advice. (O)

## 5. Payments and banking
- ☐ Bank/gateway selected; merchant agreement allows digital products and international cards. (B, O)
- ☐ Settlement currency, refunds and chargeback process documented. (B)
- ☐ Gateway sandbox tested end-to-end, then production keys stored as hosting secrets. (Claude)
- ☐ Statement descriptor shows a recognizable "One Click" name. (B)

## 6. Marketing
- ☐ Influencer/advertising disclosure rules (paid partnerships). (L)
- ☐ Email marketing consent and unsubscribe. *Built (consent checkbox; provider pending).* (L)
- ☐ Trademark search for "One Click" in Oman (and GCC/WIPO) in the relevant classes
  (9, 35, 42); decide whether to file. Flag conflicts to owner; do not rename without her. (L)

## 7. Ready to launch when
- All ☐ in sections 1-5 are ☑ or explicitly accepted by the owner in writing.
- LAUNCH_CHECKLIST.md technical items are complete.
