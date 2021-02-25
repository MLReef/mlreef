# MDataTable

## Features

- Sort by column ASC/DESC
- Delete row (without persisting)
- Editable (without persisting)
- Round decimals
- Highlight active columns

## Data Structure

A data table needs indexes for keeping track the rows and cells when user is deleting, updating or sorting, hence a simple matrix `Array<Array<String>>` is not enough.

Types:
```js
Col = {
  x: Number,              // initial position in the row [0...]
  y: Number,              // initial row number [1...] 0 is for headings
  value: Number|String    // value displayed
}

Row = {
  id: Number,             // initial row number
  cols: Array<Col>
}

DataTable = Array<Row>
```

## Notes
MDataTable was dissected attempting to making it more composable, however it's possible to reunify *MDataTableBase* with *MDataTable* without conflict.
