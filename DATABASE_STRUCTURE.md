# Pseudo-Relational Database Structure

This project uses a pseudo-relational database system with multiple JSON files, enabling cross-references and relationships between different content types.

## Database Files

### `src/data/categories.json`
Top-level categories (e.g., "CRM Software", "Email Marketing")

**Structure:**
```json
{
  "id": "crm-software",
  "slug": "crm-software",
  "title": "CRM Software",
  "description": "Customer Relationship Management software...",
  "subcategoryIds": ["crm-for-startups", "crm-for-small-businesses"]
}
```

### `src/data/subcategories.json`
Second and third-level items with parent and cross-references

**Structure:**
```json
{
  "id": "crm-for-startups",
  "slug": "crm-for-startups",
  "title": "CRM for Startups",
  "description": "CRM solutions designed for early-stage companies.",
  "parentCategoryId": "crm-software",
  "relatedCategoryIds": ["project-management"],
  "childSubcategoryIds": ["free-crm-for-startups"]
}
```

## Key Concepts

### 1. Hierarchical Relationships
- Categories contain subcategories via `subcategoryIds`
- Subcategories reference their parent via `parentCategoryId`
- Subcategories can have child subcategories via `childSubcategoryIds`
- This creates a tree structure of unlimited depth

### 2. Cross-References (Relational Links)
- Subcategories can reference other categories via `relatedCategoryIds`
- Example: "CRM for Startups" relates to "Project Management"
- This creates the "1st level hierarchy → 2nd level tag = 1st level from another database" pattern you requested

### 3. URL Generation
The full URL path is built by walking up the hierarchy:
- Category: `/crm-software/`
- Subcategory: `/crm-software/crm-for-startups/`
- Child subcategory: `/crm-software/crm-for-startups/free-crm-for-startups/`

## Database API (`src/utils/db.ts`)

The `DB` class provides utility methods for querying the relational data:

### Category Queries
```typescript
DB.getAllCategories()              // Get all categories
DB.getCategoryById(id)             // Find category by ID
DB.getCategoryBySlug(slug)         // Find category by slug
```

### Subcategory Queries
```typescript
DB.getAllSubcategories()           // Get all subcategories
DB.getSubcategoryById(id)          // Find subcategory by ID
DB.getSubcategoryBySlug(slug)      // Find subcategory by slug
```

### Relational Queries
```typescript
DB.getSubcategoriesByCategory(categoryId)  // Get all subcategories for a category
DB.getParentCategory(subcategory)          // Get parent category
DB.getRelatedCategories(subcategory)       // Get cross-referenced categories
DB.getChildSubcategories(subcategory)      // Get child subcategories
```

### Path Operations
```typescript
DB.getFullPath(subcategory)        // Build full URL path
DB.findByPath(path)                // Find item by URL path
DB.getBreadcrumbs(subcategory)     // Get breadcrumb trail
```

## Adding New Content

### Add a New Top-Level Category

1. Edit `src/data/categories.json`:
```json
{
  "id": "analytics",
  "slug": "analytics",
  "title": "Analytics Software",
  "description": "Analytics and data visualization tools.",
  "subcategoryIds": ["web-analytics", "mobile-analytics"]
}
```

### Add a New Subcategory

2. Edit `src/data/subcategories.json`:
```json
{
  "id": "web-analytics",
  "slug": "web-analytics",
  "title": "Web Analytics",
  "description": "Track and analyze website traffic.",
  "parentCategoryId": "analytics",
  "relatedCategoryIds": ["crm-software", "email-marketing"],
  "childSubcategoryIds": []
}
```

### Add Cross-References

To link a subcategory to other categories, add IDs to `relatedCategoryIds`:

```json
{
  "id": "crm-for-startups",
  "relatedCategoryIds": ["project-management", "email-marketing"]
}
```

These related categories will appear on the page in a "Related Topics" section.

## Example Relationships

Current structure demonstrates:

1. **Hierarchical**:
   - CRM Software → CRM for Startups → Free CRM for Startups

2. **Cross-Reference**:
   - "CRM for Startups" relates to "Project Management" category
   - "CRM for Small Businesses" relates to "Email Marketing" category

3. **Sibling Relationships**:
   - "CRM for Startups", "CRM for Small Businesses", and "CRM for Enterprises" are all children of "CRM Software"

## Benefits

1. **Separation of Concerns**: Each content type in its own file
2. **Reusability**: Reference the same item from multiple places
3. **Maintainability**: Update an item in one place, changes reflect everywhere
4. **Scalability**: Easy to add new categories and relationships
5. **Type Safety**: TypeScript types ensure data integrity
6. **SEO**: Clean URL structure with proper breadcrumbs and internal linking

## Extending the System

To add more content types (e.g., products, tools, authors):

1. Create new JSON file (e.g., `src/data/products.json`)
2. Add TypeScript type in `src/utils/db.ts`
3. Import data and add query methods to `DB` class
4. Reference products from subcategories using ID arrays
5. Create new pages to display product information

Example:
```typescript
// In subcategories.json
{
  "id": "crm-for-startups",
  "productIds": ["hubspot-free", "pipedrive"]  // New field
}

// In products.json
{
  "id": "hubspot-free",
  "name": "HubSpot Free CRM",
  "categoryId": "crm-for-startups"
}
```
