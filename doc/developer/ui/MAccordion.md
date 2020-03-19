MAccordion
===

Wrap every content inside **<MAccordion.Item>**.

Props for MAccordion
---
* none yet.

Props from MAccordion.Item
---
* title
* subtitle
* defaultExpanded

Example
---
```html
<MAccordion>
  <MAccordion.Item title="The first one">
    <!-- content -->
  </MAccordion.Item>

  <MAccordion.Item
    defaultExpanded
    title="Second Item"
    subtitle="This is an explanation for second."
  >    
  <!-- content -->
  </MAccordion.Item>

  <MAccordion.Item
    title="Another one"
    subtitle={(<span>a nested subtitle</span>)}
  >
    <!-- content -->
  </MAccordion.Item>
</MAccordion>
```
