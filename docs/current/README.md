# 📚 Current System Documentation

**Purpose**: Canonical documentation reflecting the actual current state of the system  
**Last Updated**: October 2, 2025  
**Status**: ✅ Active

---

## 📖 Documentation Index

### System State Documents

#### [WALLET-SYSTEM-STATE.md](./WALLET-SYSTEM-STATE.md)
**Complete reference for the CDP wallet system**

- Database schema (tables, policies, functions)
- API endpoints and their behavior
- UI components and user flows
- Security implementation
- Testing procedures
- Troubleshooting guide
- Production deployment status

**Use this for:**
- Understanding how the wallet system works
- Database queries and verification
- API integration reference
- Security audits
- Troubleshooting issues
- Onboarding new developers

---

## 🎯 Documentation Philosophy

### What Goes in `/docs/current/`
✅ **Canonical state documents** - What IS currently implemented  
✅ **Architecture reference** - How the system works NOW  
✅ **API documentation** - Current endpoint behavior  
✅ **Database schema** - Actual tables and policies  
✅ **Troubleshooting** - Common issues and solutions  

### What Does NOT Go Here
❌ Implementation plans (use `/docs/wallet/` for guides)  
❌ Historical notes (use `/docs/archive/`)  
❌ Future proposals (use `/docs/future/`)  
❌ Meeting notes or temporary docs  

---

## 🔄 Maintenance Guidelines

### When to Update
- After deploying new features
- After schema changes
- After API modifications
- When troubleshooting reveals new info
- Quarterly reviews

### How to Update
1. Make changes to actual system
2. Test and verify changes work
3. Update relevant documentation in `/docs/current/`
4. Add date and version to document
5. Update this README if adding new docs

### Version Control
- Use semantic versioning for major doc updates
- Always include "Last Updated" date
- Document who verified the information
- Link to relevant PRs or commits when applicable

---

## 📂 Related Documentation

### Other Documentation Directories

- **`/docs/wallet/`** - Setup guides and SQL scripts
- **`/docs/archive/`** - Historical implementation plans
- **`/docs/future/`** - Proposals and planning docs
- **`/docs/deployment/`** - Deployment guides
- **`/docs/security/`** - Security policies and audits
- **`/docs/testing/`** - Test plans and procedures

### Quick Links

**Wallet System:**
- Current State: [WALLET-SYSTEM-STATE.md](./WALLET-SYSTEM-STATE.md)
- Database Setup: [/docs/wallet/CDP-WALLET-SETUP.sql](/docs/wallet/CDP-WALLET-SETUP.sql)
- Quick Start: [/docs/wallet/README.md](/docs/wallet/README.md)

**Authentication:**
- Profile System: Check `/docs/profile/`
- Auth Flow: Check `/docs/security/`

---

## ✅ Documentation Quality Checklist

Before adding a document to `/docs/current/`:

- [ ] Document reflects ACTUAL current state (not plans)
- [ ] All code examples are tested and working
- [ ] Database queries return expected results
- [ ] API endpoints behave as documented
- [ ] Include troubleshooting section
- [ ] Include "Last Updated" date
- [ ] Include version number
- [ ] Links to related docs are valid
- [ ] Clear navigation and table of contents
- [ ] Examples are copy-paste ready

---

## 🎯 Using This Documentation

### For New Developers
1. Start with this README
2. Read [WALLET-SYSTEM-STATE.md](./WALLET-SYSTEM-STATE.md)
3. Review `/docs/wallet/README.md` for quick start
4. Check `/docs/deployment/` for deployment info

### For Debugging
1. Check [WALLET-SYSTEM-STATE.md](./WALLET-SYSTEM-STATE.md) troubleshooting section
2. Use database verification queries
3. Check Supabase logs
4. Review API error responses

### For API Integration
1. Read API Endpoints section in [WALLET-SYSTEM-STATE.md](./WALLET-SYSTEM-STATE.md)
2. Check request/response schemas
3. Review authentication requirements
4. Test with provided examples

### For Database Work
1. Review database schema in [WALLET-SYSTEM-STATE.md](./WALLET-SYSTEM-STATE.md)
2. Check RLS policies
3. Use verification queries
4. Reference `/docs/wallet/CDP-WALLET-SETUP.sql` for schema creation

---

## 📝 Contributing

### Adding New Documentation

1. **Determine Category**
   - Current state → `/docs/current/`
   - Setup guide → `/docs/wallet/` or relevant feature folder
   - Historical → `/docs/archive/`
   - Future planning → `/docs/future/`

2. **Create Document**
   - Use clear, descriptive filename
   - Include metadata (date, version, status)
   - Add to relevant README
   - Update this index if needed

3. **Quality Check**
   - Test all code examples
   - Verify all queries work
   - Check all links are valid
   - Ensure consistent formatting

4. **Review Process**
   - Self-review against checklist
   - Test on clean environment
   - Get peer review if major update
   - Merge after verification

---

## 🔍 Search Tips

### Finding Information

**Database related:**
- Schema: Search "database schema" in WALLET-SYSTEM-STATE.md
- Queries: Search "verification queries" or "maintenance"
- Tables: Search specific table name like "user_wallets"

**API related:**
- Endpoints: Search "API ENDPOINTS" section
- Errors: Search "troubleshooting" or specific error message
- Examples: Search "Request Body" or "Response"

**UI related:**
- Components: Search "UI COMPONENTS" section
- Features: Search "ProfileWalletCard"
- Styling: Search "design" or "responsive"

---

## 📊 Document Status

| Document | Version | Last Updated | Status |
|----------|---------|--------------|--------|
| README.md | 1.0 | Oct 2, 2025 | ✅ Current |
| WALLET-SYSTEM-STATE.md | 2.0 | Oct 2, 2025 | ✅ Current |

---

**Maintained by**: Development Team  
**Review Frequency**: Quarterly (or after major changes)  
**Contact**: See project README for team contact info

