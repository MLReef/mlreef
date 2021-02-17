# Tutorial

## Tutorial media files
`web/public/tutorials/:id` id is the tutorial id, just for convention.

## Structure:

Tutorial content is located in `./data.json` file, which is an array of tutorials with the following structure:

- id: [Int] (internal)
- name: (displayed)
- visibility: (hidden|users) Only hidden has been implemented
- description: [String] visible in the tutorial list
- image: [String] url to the frontpage image
- epilogue: [Markdown] (optional) last words once tutorial is ended
- steps: [Array] Once the tutorial is selected execute these steps
  + id: [Int] (displayed) step's number
  + name: [String] step's name (unused)
  + tasks: [Array] list of task to be executed in sequence
    * id: [Int] (displayed) task's number
    * layoutType: [Int] so far 1 for instruction card and 2 for feedback card
    * title: (displayed) title of the task
    * image: [String] url to the image
    * instructions / feedback: [Markdown] (displayed) depending on the layoutType
    * validators: [Array] (internal) list of conditions that can trigger the next step. Should meet just one
      - type: [urlCheck|hashCheck|clickListener|presence]
      - selector: [String] (clickListener only) css selector for the button to listen
      - regex: [RegExp] (urlChecker only) regular expression for the url to mach
      - placeholders: [Array(String)] (urlChecker only) placeholders that in the regex starts with colon to be replaced with dynamic data, e.g. :username

## Markdown fields
`instructions`, `feedback` and `epilogue` fields accept markdown, and the links are using the react router. However, since the information is wrapped in a json it needed to write line breaks as `\n` and scape double quotes `\"`. A good strategy is writting the content in an external markdown editor and then replacing as:
in Atom.io
- Copy the markdown content to a new file
- Perform a search/replace with regular expression look up `\n` and replace them for `&&&` or any intermediate placeholder. All lines must be concatenated in one.
- Perform a normal search/replace look up `&&&` and replace with `\n`
- Perform a normal search/replace loop up `"` and replace with `\"`.
- Copy the line and paste it in the json field wrapped with ""

## Validator explanation
Every task accepts an array of conditions and only one needed, because a task can be made in more than one way.

### urlChecker
**urlChecker** this is satisfied when the URL matches the *regex* field which accepts a Regular Expression. Also accepts placeholders that are dynamically replaced. At the moment only the :username placeholder has been implemented.

Example:
```json
{
  "validators": [
    {
      "type": "urlChecker",
      "regex": "^/:username/basic-tutorial",
      "placeholders": ["username"]
    }
  ]
}
```

`:username` will be replaced with the current username.

### hashChecker
**hasChecker** only checks the hash part of the URL (# sign included).

Example:
```json
{
  "validators": [
    {
      "type": "hashChecker",
      "regex": "#explore"
    }
  ]
}
```

### clickListener
**clickListener** is satisfied when a button that matches *selector* field is clicked. The selector can be anything accepted by *querySelector()*. Notice that the button must exist by the moment the task is triggered, and sometimes some frontend parts are rendered in demand.

Example:
```json
{
  "validators": [
    {
      "type": "clickListener",
      "selector": "#execute-button"
    }
  ]
}
```

### presence
**presence** (experimental) is satisfied when any element that matches *postSelector* field is rendered. The validator engine will check every 2 seconds if the element exists, once satisfied the checker will stop (hypothetically). The validator check will run only if for the time the task is triggered already exist a *preSelector* element.

Example:
```json
{
  "validators": [
    {
      "type": "presence",
      "preSelector" : ".tutorial-data",
      "postSelector": ".tutorial-data-loaded"
    }
  ]
}
```

For the time the task is triggered we need an element with the class *tutorial-data* to start checking for another element with a *tutorial-data-loaded* class, otherwise this validator will be ignored (to avoid unexpected checks). This is useful when dragging pre-procesors.
