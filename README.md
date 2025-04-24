# simple-pandiff-action

Github action which outputs a [pandiff](https://github.com/davidar/pandiff) prose differences for all text files in a repository for a given PR

## Consume example

```yml
name: Review Prose Changes
on: [pull_request]

jobs:
  prose-review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Pandiff
        id: pandiff
        uses: carafelix/simple-pandiff-action@1
        with:
          # Optional: specify file extensions in the form of space sperated values, defaults to *.md
          file_extensions: "*.md *.txt"

      - name: Process and display diffs
        run: |
          # Do whatever you want with it
          echo '${{ steps.pandiff.outputs.diffs }}' | jq .
        shell: bash
```
## Output example
```json
[
  {
    "filename": "no.md",
    "diff": "<p>\n<ins>\nno thanks\n</ins>\n</p>"
  },
  {
    "filename": "yes.md",
    "diff": "<p>\n<ins>\nyes please\n</ins>\n</p>"
  }
]
```
