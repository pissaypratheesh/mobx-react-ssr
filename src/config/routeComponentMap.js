const routes = {
  "/":{
    component: "Home",
    path: "@components/CssModule",
    exact: true,
    name: "home"
  },

  "/layout": {
    component: "Home",
    path: "@components/AppLayout",
    exact: true,
    name: "layout"

  },

  "/home": {
    component: "Home",
    path: "@components/AppLayout",
    exact: true,
    name: "layout"

  },

  "/home/article":{
    component: "Home",
    path: "@components/CssModule",
    exact: true,
    name: "article"
  },

/*  "*": {
    component: "Home",
    path: "@components/CssModule",
    exact: false,
    name: "notFound"
  }*/
}
export default routes;

