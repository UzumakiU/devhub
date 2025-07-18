# UI Component Library - Accessibility Guidelines

## Overview

Our UI component library is built with accessibility as a core principle. All components follow WCAG 2.1 AA guidelines and include proper ARIA attributes, keyboard navigation, and screen reader support.

## General Accessibility Features

### Keyboard Navigation

- All interactive components support keyboard navigation
- Focus indicators are clearly visible
- Tab order follows logical structure
- Escape key closes modals and dropdowns

### Screen Reader Support

- Semantic HTML elements used throughout
- Proper ARIA labels and descriptions
- Live regions for dynamic content
- Clear heading hierarchy

### Color and Contrast

- All text meets WCAG AA contrast requirements
- Color is not the only way to convey information
- Focus indicators are high contrast
- Error states include icons and text

## Component-Specific Guidelines

### Form Components

#### FormField

- Automatically generates unique IDs for form controls
- Associates labels with form controls using `htmlFor`
- Error messages are announced to screen readers with `aria-describedby`
- Required fields are marked with `aria-required` and visual indicator

```jsx
<FormField label="Email Address" required error="Please enter a valid email">
  <Input type="email" placeholder="Enter your email" />
</FormField>
```

#### FormValidation

- Error messages are announced immediately
- Validation happens on blur to avoid interrupting typing
- Error summaries are provided for complex forms
- Success messages are also announced

### Table Components

#### DataTable

- Uses semantic table elements (`table`, `thead`, `tbody`, `th`, `td`)
- Column headers have proper scope attributes
- Sortable columns are keyboard accessible
- Row selection is announced to screen readers
- Empty states provide clear messaging

```jsx
<DataTable
  data={data}
  columns={columns}
  onSort={handleSort}
  selectable
  emptyMessage="No data available"
/>
```

### Layout Components

#### Container

- Maintains logical document structure
- Responsive breakpoints consider readability
- Content flows properly at all zoom levels

#### Grid

- Uses CSS Grid with proper semantic structure
- Grid items maintain reading order
- Responsive behavior preserves content hierarchy

### Feedback Components

#### Alert

- Uses `role="alert"` for important messages
- Error alerts are announced immediately
- Dismissible alerts have accessible close buttons
- Icons are decorative with `aria-hidden="true"`

```jsx
<Alert
  variant="error"
  title="Error"
  dismissible
  onDismiss={handleDismiss}
>
  Please fix the validation errors below.
</Alert>
```

#### Toast

- Uses ARIA live regions for announcements
- Auto-dismiss timing can be paused on hover/focus
- Action buttons are keyboard accessible
- Multiple toasts are managed in proper order

#### Loading

- Loading states are announced to screen readers
- Skeleton screens maintain proper heading structure
- Loading overlays prevent interaction with stale content
- Progress indicators show completion status when available

## Best Practices

### For Developers

1. **Always test with keyboard only**
   - Tab through all interactive elements
   - Ensure all functionality is accessible
   - Test escape key behavior

2. **Use screen reader testing**
   - Test with VoiceOver (macOS) or NVDA (Windows)
   - Verify all content is announced properly
   - Check for meaningful element descriptions

3. **Validate HTML semantics**
   - Use proper heading hierarchy (h1, h2, h3...)
   - Ensure form labels are associated correctly
   - Use landmark roles appropriately

4. **Test color contrast**
   - Use tools like WebAIM's contrast checker
   - Test in high contrast mode
   - Verify focus indicators are visible

### Common Patterns

#### Form Validation

```jsx
// Good: Error is announced and associated with input
<FormField 
  label="Password" 
  required 
  error="Password must be at least 8 characters"
>
  <Input 
    type="password" 
    aria-invalid="true"
    aria-describedby="password-error"
  />
</FormField>

// Bad: Error not associated with input
<Input type="password" />
<div className="error">Password must be at least 8 characters</div>
```

#### Interactive Elements

```jsx
// Good: Button has clear label and keyboard support
<Button 
  onClick={handleDelete}
  variant="danger"
  aria-label="Delete user John Doe"
>
  <TrashIcon aria-hidden="true" />
  Delete
</Button>

// Bad: Icon-only button without label
<Button onClick={handleDelete}>
  <TrashIcon />
</Button>
```

#### Dynamic Content

```jsx
// Good: Loading state is announced
<div>
  {loading ? (
    <Loading text="Loading user data..." />
  ) : (
    <UserList users={users} />
  )}
</div>

// Bad: Loading state not announced
<div>
  {loading ? <Spinner /> : <UserList users={users} />}
</div>
```

## Testing Checklist

### Automated Testing

- [ ] All form elements have labels
- [ ] Images have alt text
- [ ] Color contrast meets WCAG AA
- [ ] Page has valid HTML structure
- [ ] ARIA attributes are used correctly

### Manual Testing

- [ ] All functionality works with keyboard only
- [ ] Screen reader announces all content properly
- [ ] Focus indicators are clearly visible
- [ ] Content reflows properly at 200% zoom
- [ ] High contrast mode works correctly

### Browser Testing

- [ ] Chrome with ChromeVox extension
- [ ] Firefox with NVDA (Windows)
- [ ] Safari with VoiceOver (macOS)
- [ ] Edge with built-in narrator

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

## Getting Help

If you have questions about accessibility or need help implementing accessible patterns:

1. Check this documentation first
2. Review the component examples in Storybook
3. Consult the ARIA Authoring Practices Guide
4. Ask in the #accessibility Slack channel
5. Request an accessibility review for complex components
