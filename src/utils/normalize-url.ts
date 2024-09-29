export function normalize(repo: string) {
  var regex = /^(?:(direct):([^#]+)(?:#(.+))?)$/
  var match = regex.exec(repo)

  if (match) {
    var url = match[2]
    var directCheckout = match[3] || 'master'

    return {
      type: 'direct',
      url: url,
      checkout: directCheckout,
    }
  }
}
