export default class MoreButton {
  constructor() {
    this.button = document.querySelector('.load-more');
  }

  show() {
    this.button.classList.remove('is-hidden');
  }

  hide() {
    this.button.classList.add('is-hidden');
  }
}
