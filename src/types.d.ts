declare module 'download-git-repo' {
    interface DownloadOption {
        clone?: boolean
    }
    function download(
        repo: string,
        destination: string,
        options?: DownloadOption,
        callback?: (err?: string) => void
    ): void

    export default download
}
