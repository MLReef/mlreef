MTab
===

Wrap every content inside **<MTab.Tab>** and tabs panel will auto generated.

Props for MTab
---
* vertical

Props from MTab.Tab
---
* id (required)
* label (required)
* callback
* defaultActive

Example
---
```html
<MTabs>
  <MTabs.Tab id="roles" label="The Roles">
    <!-- content for roles -->
  </MTabs.Tab>

  <MTabs.Tab
    defaultActive
    id="permission"
    label="My Permissions"
    callback="<!-- to pass a function callback -->"
  >    
  <!-- content for permissions -->
  </MTabs.Tab>

  <MTabs.Tab id="misc" label="Other Stuff">
    <!-- example of nested tabs -->
    <MTabs vertical>

      <MTabs.Tab id="roles" label="The Roles">
        <!-- content for roles -->
      </MTabs.Tab>

      <MTabs.Tab id="project" label="Poject settings">
        <!-- content for project -->
      </MTabs.Tab>

      <MTabs.Tab defaultActive id="misc" label="Other Stuff">
        <!-- content for misc -->
      </MTabs.Tab>

    </MTabs>
    <!-- end of second tabs -->
  </MTabs.Tab>

</MTabs>
```
