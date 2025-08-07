# Contributing to ELLALLE

Thank you for your interest in contributing to ELLALLE! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/ellalle.git`
3. **Install** dependencies: `yarn install`
4. **Create** a branch: `git checkout -b feature/your-feature-name`
5. **Make** your changes
6. **Test** locally: `yarn dev` and `yarn build`
7. **Commit** and **push** your changes
8. **Create** a pull request

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18+)
- **Yarn package manager (required - do not use npm)**
- Git
- MetaMask browser extension for testing

### Environment Setup
```bash
# Install dependencies (use Yarn only)
yarn install

# Copy environment template
cp .env.example .env.local

# Start development server
yarn dev
```

> **⚠️ Important**: This project uses Yarn exclusively. Using npm or other package managers may cause dependency conflicts.

## 📋 Code Standards

### TypeScript
- Use TypeScript for all new code
- Export types and interfaces when shared
- Use proper type annotations
- Avoid `any` types

### React Components
- Use functional components with hooks
- Follow the single responsibility principle
- Use descriptive component and prop names
- Implement proper error boundaries

### Styling
- Use Tailwind CSS utility classes
- Follow the existing design system
- Use shadcn/ui components when possible
- Maintain responsive design principles

### File Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── [ComponentName].tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
├── pages/              # Page components
└── main.tsx           # Application entry point
```

## 🧪 Testing Guidelines

### Before Submitting
- [ ] Code builds without errors (`yarn build`)
- [ ] No TypeScript errors (`yarn type-check`)
- [ ] Code passes linting (`yarn lint`)
- [ ] Code is properly formatted (`yarn format`)
- [ ] Application runs correctly (`yarn dev`)
- [ ] Changes work on different screen sizes

### Manual Testing
- Test on desktop and mobile viewports
- Verify dark/light mode compatibility
- Check wallet connection flows (if applicable)
- Test with different browser extensions

## 📝 Commit Guidelines

### Commit Message Format
```
type(scope): description

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(trading): add dark pool integration
fix(wallet): resolve connection timeout issue
docs(readme): update installation instructions
style(components): apply consistent spacing
```

## 🔍 Pull Request Process

### Before Creating a PR
1. Ensure your branch is up to date with `main`
2. Run all checks: `yarn lint && yarn type-check && yarn build`
3. Test your changes thoroughly
4. Update documentation if needed

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tested locally
- [ ] Responsive design verified
- [ ] No console errors
- [ ] Build passes

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Additional Notes
[Any additional information]
```

## 🌐 Web3 Specific Guidelines

### Smart Contract Integration
- Always verify contract addresses
- Use proper error handling for blockchain calls
- Implement loading states for transactions
- Handle different network conditions

### Wallet Integration
- Support multiple wallet providers
- Implement proper connection/disconnection flows
- Handle network switching gracefully
- Respect user privacy preferences

### Security Considerations
- Never log private keys or sensitive data
- Validate all user inputs
- Use secure random number generation
- Implement proper access controls

## 🐛 Bug Reports

### Before Reporting
- Check existing issues
- Try to reproduce the bug
- Gather system information

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Wallet: [e.g., MetaMask, WalletConnect]
- Version: [e.g., 1.0.0]

**Screenshots**
[If applicable]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Problem It Solves**
What problem does this address?

**Proposed Solution**
How should this be implemented?

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Screenshots, mockups, or examples
```

## 📄 Documentation

### Code Documentation
- Use JSDoc comments for functions
- Document complex algorithms
- Explain Web3-specific implementations
- Update README for significant changes

### API Documentation
- Document all API endpoints
- Include request/response examples
- Note any authentication requirements
- Specify rate limits

## 🔒 Security

### Reporting Security Issues
- **Never** create public issues for security vulnerabilities
- Email: security@ellalle.com
- Include detailed reproduction steps
- Allow time for responsible disclosure

### Security Best Practices
- Keep dependencies updated
- Use secure coding practices
- Implement proper input validation
- Follow OWASP guidelines

## 📞 Getting Help

- **Documentation**: Check the README and docs/
- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Create an issue for bugs or feature requests
- **Discord**: Join our community discord (coming soon)

## 📜 License

By contributing to ELLALLE, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to ELLALLE! 🚀**
