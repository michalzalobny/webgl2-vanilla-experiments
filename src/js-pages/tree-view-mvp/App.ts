const data = [
  {
    name: 'test0',
    id: 0,
    parent: null,
  },
  {
    name: 'test1',
    id: 1,
    parent: 0,
  },
  {
    name: 'test2',
    id: 2,
    parent: 0,
  },
  {
    name: 'test3',
    id: 3,
    parent: 1,
  },
  {
    name: 'test4',
    id: 4,
    parent: 3,
  },
];

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
});

class App {
  wrapper: HTMLElement;

  constructor() {
    this.wrapper = document.querySelector('[data-tree="wrapper"]') as HTMLElement;
  }
}
