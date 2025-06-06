import ghpages from "gh-pages"
interface GhPagesConfig{
    input: string;
}
export  async function ghPages(config: GhPagesConfig) {
    const str = `${config?.input}`
    await ghpages.publish(str,{
    }, function (err:Error) {
        if (err) {
            console.log('publish Error', err);
        }
        console.log('publish Success');
    })
}
