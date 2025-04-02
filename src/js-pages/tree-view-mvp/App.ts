document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
});

class App {
  wrapper: HTMLElement;

  constructor() {
    this.wrapper = document.querySelector('[data-tree="wrapper"]') as HTMLElement;
  }
}
