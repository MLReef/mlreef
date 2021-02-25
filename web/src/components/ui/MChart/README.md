# MGraph
This component creates a graph using [Plotly JS](https://plotly.com/javascript/) linked to a [MDataTable](/web/src/components/ui/MDataTable) (optional) that allows to see real time table data changes.

## Concepts
  + *data* or *richData* [see](/web/src/components/ui/MDataTable/README.md#L9)
  + *series* is an array of objects that contain the information that *Plotly* needs, each element is a line.
  + *blueprints* is an array with information which will be transformed in *series* later. *blueprints* are intended to be a middle point between what *Plotly* and other implementations require.
  + *unfoldValue* extracts a value (aka cell or field) from the table.
  + *actives* highlight the active columns in the table, such as those that are in the graph.

## Serie construction
In a *Plotly serie* the data is an array of values in *y* field, and these are in fact, table columns, therefore *unfoldValue()* in conjunction with *getColumn()* goes throughout the table and construct *y*. Having a *memoized* function the graph will change altogether with the table data.
