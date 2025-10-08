// List of domains to block. If a link contains any of these domains, it will be hidden
const parashaList = [".ru", ".by", ".kz", ".kg", "yandex", "vk.com", "vk.me"];

// Removes an element from the page
function removeElement(el)
{
    el.remove();
}

// Function to process search results for the DuckDuckGo search engine
function duckDuckGo()
{
    // "All" tab
    document.querySelectorAll('a[data-testid="result-title-a"]').forEach(link => 
    {
        if(parashaList.some(domain => link.href.includes(domain))) 
        {
            removeElement(link.closest("article"));
        }
    });

    // "Images" tab
    document.querySelectorAll(".nsogf_Hpj9UUxfhcwQd5").forEach(imgBlock =>
    {
        const link = imgBlock.querySelector(".iHufrGzRLnW5Wh3koaLG");

        if(link && parashaList.some(domain => link.textContent.includes(domain))) 
        {
            const imageListItem = imgBlock.parentNode;
            removeElement(imageListItem);
        }
    });

    // "News" tab
    document.querySelectorAll(".O9Ipab51rBntYb0pwOQn").forEach(newsBlock => {
        const linkDiv = newsBlock.querySelector(".hsgD5pJVzSAt58DaSA9w");
        if(linkDiv === null)
        {
            return;
        }

        const link  = linkDiv.querySelector("span").textContent;
        if(parashaList.some(domain => link.includes(domain)))
        {
            removeElement(newsBlock);
        }
    });
}

function google()
{
    // "All" tab
    document.querySelectorAll(".MjjYud").forEach(block => 
    {
        const linkEl = block.querySelector(".zReHs");

        if(linkEl === null)
        {
            return;
        }

        const linkHref = linkEl.href;
        if(parashaList.some(domain => linkHref.includes(domain)))
        {
            removeElement(block);
        }
    })
}

function main() 
{
    duckDuckGo();
    google();
}

main();

const observer = new MutationObserver(main);
observer.observe(document.body, { childList: true, subtree: true });
