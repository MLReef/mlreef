## API GUIDELINES 

### Backend paging endpoints:

Some endpoints in the backend are paginated, so they won't respond at the very beginning with all the available registries, they instead wait for page and size as parameters to sort the DB entries.

#### Example of request:
?page=${page}&size=${size}

This is the query that the developer can add to the base url, to speficy to the backend which page he wants and how many endtries should that page contain.

#### Example of response:

```{
	"content": [
        
	],
	"pageable": {
		"sort": {
			"sorted": false,
			"unsorted": true,
			"empty": true
		},
		"page_size": 5,
		"page_number": 0,
		"offset": 0,
		"paged": true,
		"unpaged": false
	},
	"last": false,
	"total_pages": 5,
	"total_elements": 22,
	"sort": {
		"sorted": false,
		"unsorted": true,
		"empty": true
	},
	"first": true,
	"number_of_elements": 5,
	"size": 5,
	"number": 0,
	"empty": false
}
```