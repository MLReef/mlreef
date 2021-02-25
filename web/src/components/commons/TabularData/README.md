# TabularData

Is a large component for creating and working with graph connected to a data table. It uses [Plotly JS](https://plotly.com/javascript/) and the react version *react-plotly* which are imported lazily.

*TabularData*'s table is inspired in [MDataTable](/web/src/components/ui/MDataTable) but it ended up being a different implementation.

## Concepts
- *matrix*: is the original data as `Array<Array<T>>`
- *data*: or *richData* is the indexed data. See *MDataTable* for more information.
- *charts*: is an array of objects that contains all information needed for creating a graph for [MChart](/web/components/ui/MChart)
- *plotTypes* these are pre-configurations for *TabularDataGraphCreator* that satisfy *MChart* and *Plotly*


## Parts

### Loading data
*TabularDataFeeder* is the component that carries out loading and parsing data, using a file explorer for the repository content or an uploading file input. Only one data source is allowed at the time and this can be *CSV* or *json* with the following structure:

```js
{
  0: {
    columnName1: String|Number,
    columnName2: String|Number,
    // ...
  },
  1: {
    columnName1: String|Number,
    columnName2: String|Number,
    // ...
  },
  // ...
}
```

or

```js
[
  {
    columnName1: String|Number,
    columnName2: String|Number,
    // ...
  },
  {
    columnName1: String|Number,
    columnName2: String|Number,
    // ...
  },
  // ...
]
```
The functions for parsing and sanitizing the data are located in `./functions.js`

### Creating a new graph

*TabularDataGraphCreator* opens a context dialog and guides the user through the creation of a new graph which is just an object that satisfies *MChart* blueprints and is subsequently appended to *charts* downstream. It requires as input the *matrix* and it also creates a thumbnail using *Plotly* methods. All new features for graphs (such as bar graphics, etc.) should be added in *plotTypes* and the inputs should be adapted this component.


### Working with a graph and table

This part corresponds to [MChart](/web/src/components/ui/MChart) component.

### Saving graphs
Not implemented yet.
