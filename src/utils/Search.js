class Search {

  constructor(discovery, identityManager) {

    if (!discovery) throw new Error('The discovery component is a needed parameter');
    if (!identityManager) throw new Error('The identityManager component is a needed parameter');

    let _this = this;

    _this.discovery = discovery;
    _this.identityManager = identityManager;

  }

  myIdentity() {
    let _this = this;

    return new Promise(function(resolve, reject) {

      _this.identityManager.discoverUserRegistered().then((result) => {
        resolve(result);
      }).catch((reason) => {
        reject(reason);
      });

    });

  }

  /**
   * List of usersURL to search
   * @param  {array<URL.userURL>}  users List of UserUR, like this format user://<ipddomain>/<user-identifier>
   * @return {Promise}
   */
  users(usersURLs, providedDomains, schemes, resources) {

    if (!usersURLs) throw new Error('You need to provide a list of users');
    if (!providedDomains) throw new Error('You need to provide a list of domains');
    if (!resources) throw new Error('You need to provide a list of resources');
    if (!schemes) throw new Error('You need to provide a list of schemes');

    let _this = this;

    return new Promise(function(resolve) {

      console.log('Users: ', usersURLs, usersURLs.length);
      console.log('Domains: ', providedDomains, providedDomains.length);

      if (usersURLs.length === 0) {
        console.info('Don\'t have users to discovery');
        resolve(usersURLs);
      } else {
        let getUsers = [];

        usersURLs.forEach((userURL, index) => {
          let currentDomain = providedDomains[index];
          console.log('Search user ' + userURL + ' for provided domain:', currentDomain);
          getUsers.push(_this.discovery.discoverHyperty(userURL, schemes, resources, currentDomain));
        });

        console.info('Requests promises: ', getUsers);

        Promise.all(getUsers).then((hyperties) => {

          let result = hyperties.map(function(hyperty) {

            let recent = Object.keys(hyperty).reduceRight(function(a, b) {
              let hypertyDate = new Date(hyperty[b].lastModified);
              let hypertyDateP = new Date(hyperty[a].lastModified);
              if (hypertyDateP.getTime() < hypertyDate.getTime()) {
                return b;
              }
              return a;
            });
            return hyperty[recent];
          });

          let clean = result.filter((hyperty) => {
            return hyperty;
          });

          console.info('Requests result: ', clean);
          resolve(clean);

        }).catch((reason) => {
          console.error(reason);
          resolve(usersURLs);
        });
      }
    });
  }
}

export default Search;