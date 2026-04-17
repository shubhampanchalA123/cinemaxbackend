class BaseMovieProvider {
  constructor(name) {
    this.name = name;
  }

  async getPopular(page = 1) {
    throw new Error('Method not implemented');
  }

  async getTrending() {
    throw new Error('Method not implemented');
  }

  async getDetails(id) {
    throw new Error('Method not implemented');
  }

  async getVideos(id) {
    throw new Error('Method not implemented');
  }

  async search(query, page = 1) {
    throw new Error('Method not implemented');
  }

  async getTopRated(page = 1) {
    throw new Error('Method not implemented');
  }

  async getSimilar(id, page = 1) {
    throw new Error('Method not implemented');
  }

  async getById(imdbId) {
    throw new Error('Method not implemented');
  }
}

module.exports = BaseMovieProvider;