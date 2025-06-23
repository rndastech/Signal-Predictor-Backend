# Footer Component Usage

The Footer component has been created to match your website's dark futuristic theme. Here's how to use it:

## Automatic Integration (Recommended)

The Footer is automatically included in the `Layout` component, so any page wrapped with `Layout` will have the footer:

```jsx
import Layout from './components/Layout';

const MyPage = () => {
  return (
    <Layout>
      <div>Your page content here</div>
    </Layout>
  );
};
```

## Manual Integration

If you need to use the Footer separately:

```jsx
import Footer from './components/Footer';

const MyPage = () => {
  return (
    <div>
      <div>Your page content</div>
      <Footer />
    </div>
  );
};
```

## Features

- **Dark Theme**: Matches your website's futuristic black theme with gold and purple accents
- **Responsive Design**: Works on all screen sizes
- **Animated Elements**: Includes shimmer effects and hover animations
- **Social Links**: GitHub, LinkedIn, Twitter, Discord (currently placeholder links)
- **Organized Sections**: Features, Resources, Support, and Legal sections
- **Brand Logo**: Signal Predictor logo with wave icon

## Customization

To customize the footer:

1. **Update Social Links**: Edit the social media URLs in `components/Footer.js`
2. **Modify Sections**: Add/remove footer links in the respective sections
3. **Styling**: Modify `css/Footer.css` for style changes
4. **Layout Styling**: Modify `css/Layout.css` for layout adjustments
5. **Colors**: Update the CSS variables for different color schemes

## Footer Structure

- **Brand Section**: Logo, description, and social media links
- **Features**: Links to main app features (Upload, Generate, Analytics)
- **Resources**: Documentation and learning materials
- **Support**: Help and community links  
- **Legal**: Privacy, terms, and legal information

The footer automatically adapts to mobile screens with centered layout and stacked sections.
