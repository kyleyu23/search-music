//API
const Api = (() => {
  const baseURL = "https://itunes.apple.com/search?term=";
  const params = "&media=music&entity=album&attribute=artistTerm&limit=50";

  const getAlbums = (artistName) =>
    fetch([baseURL, artistName, params].join()).then((response) =>
      response.json()
    );

  return {
    getAlbums,
  };
})();

//VIEW
const View = (() => {
  const domstr = {
    albumlist: ".albumlist",
    searchbutton: ".search-button",
    searchbar: ".search-bar",
  };

  const render = (ele, tmp) => {
    ele.innerHTML = tmp;
  };

  const createTmp = (arr) => {
    let tmp = "";

    arr.forEach((album) => {
      tmp += `
        <div class="album-container">
        <img
            src=${album.image}
            alt="album-image"
        />
        <h3>${album.title}</h3>
        </div>
    `;
    });
    return tmp;
  };

  return {
    domstr,
    render,
    createTmp,
  };
})();

//MODEL
const Model = ((api, view) => {
  class Album {
    constructor(title, image) {
      this.title = title;
      this.image = image;
    }
  }

  class State {
    #albumlist = [];

    get albumlist() {
      return this.#albumlist;
    }

    set albumlist(newalbumlist) {
      this.#albumlist = newalbumlist;
      const albumlistEle = document.querySelector(view.domstr.albumlist);
      const tmp = view.createTmp(this.albumlist);
      view.render(albumlistEle, tmp);
    }
  }

  const getAlbums = api.getAlbums;

  return {
    Album,
    getAlbums,
    State,
  };
})(Api, View);

//CONTROLLER

const Controller = ((model, view) => {
  const state = new model.State();

  const search = () => {
    const searchButton = document.querySelector(view.domstr.searchbutton);
    const searchBar = document.querySelector(view.domstr.searchbar);

    searchButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (!searchBar.value) return;

      model.getAlbums(searchBar.value).then((data) => {
        searchBar.value = "";

        const albums = data.results;

        state.albumlist = [];

        albums.forEach((album) => {
          const albumTitle = album.collectionName ?? "Album Name";
          const albumImgUrl = album.artworkUrl100 ?? "Image";
          const newalbum = new model.Album(albumTitle, albumImgUrl);
          state.albumlist = [newalbum, ...state.albumlist];
        });
      });
    });
  };

  const bootstrap = () => {
    search();
  };

  return { bootstrap };
})(Model, View);

Controller.bootstrap();
