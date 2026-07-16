export const Motivos = {
  getMockMotivos() {
    return [
        {'name':'mot1'},
        {'name':'mot2'},
        {'name':'mot3'},
    ]
  },
  getMotivos() {
    return Promise.resolve(this.getMockMotivos())
  },
}