import appStore from './appStore';

const allStore = () => ({
  homeStore: {name: 'bob', age: '12'},
  appStore: new appStore()
});

export default allStore();
