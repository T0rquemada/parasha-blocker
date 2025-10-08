// List of domains to block
let parashaList = [];

// Removes an element from the page
function removeElement(el)
{
    el.remove();
}

function handleLink(link, targetBlock)
{
    if(parashaList.some(domain => link.includes(domain))) 
    {
        removeElement(targetBlock);
    }
}

// Function to process search results for the DuckDuckGo search engine
function duckDuckGo()
{
    // "All" tab
    document.querySelectorAll('a[data-testid="result-title-a"]').forEach(link => 
    {
        const linkHref = link.href;
        handleLink(linkHref, link.closest("article"));
    });

    // Images on "All" tab
    document.querySelectorAll(".pmq91M1H9uYaJG_lxmPg").forEach(el => {
        const link = el.querySelector(".SdDhImKi0Wx51uB1gMgj").textContent;
        handleLink(link, el);
    })

    // "Images" tab
    document.querySelectorAll(".nsogf_Hpj9UUxfhcwQd5").forEach(imgBlock =>
    {
        const link = imgBlock.querySelector(".iHufrGzRLnW5Wh3koaLG");
        const imageDiv = imgBlock.parentNode;
        handleLink(link.textContent, imageDiv);
    });

    // "News" tab
    document.querySelectorAll(".O9Ipab51rBntYb0pwOQn").forEach(newsBlock => {
        const linkDiv = newsBlock.querySelector(".hsgD5pJVzSAt58DaSA9w");
        if(linkDiv === null)
        {
            return;
        }

        const link  = linkDiv.querySelector("span").textContent;
        handleLink(link, newsBlock);
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

function bing()
{
    document.querySelectorAll(".b_algo").forEach(el => {
        const link = el.querySelector(".b_attribution").querySelector('cite').textContent; 
        handleLink(link, el);
    });
}

function main() 
{
    duckDuckGo();
    google();
    bing();
}

// Load parashaList from .txt file
async function loadParashaList()
{
    try
    {
        const url = chrome.runtime.getURL('parashaList.txt');
        const response = await fetch(url);
        const text = await response.text();
        parashaList = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        main();
        const observer = new MutationObserver(main);
        observer.observe(document.body, { childList: true, subtree: true });
    }
    catch(error)
    {
        console.error('Failed to load parashaList.txt:', error);
    }
}

// Initialize
loadParashaList();