Ah, yes — then don’t bind the table directly to the persisted master list.

Use two pieces of state:

state: () => ({
  allRows: [] as Row[],      // persisted / source data
  tableRows: [] as Row[]     // what DataTable displays
})

Then:

actions: {
  loadRows(rows: Row[]) {
    this.allRows = rows
    this.tableRows = [...rows]
  },

  clearTable() {
    this.tableRows = []
  },

  restoreTable() {
    this.tableRows = [...this.allRows]
  }
}

And your DataTable uses:

<DataTable :value="store.tableRows" />

So:

allRows = preserved data
tableRows = current visual table contents

That lets the “clean/search/reset” behavior affect the screen without destroying the stored dataset.