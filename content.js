// 1. Robust API detection (Checks global scope, not just window)
// This safely grabs 'browser' (Firefox) or falls back to 'chrome' (Chromium)
const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

class ParashaBlocker {
    constructor() {
        this.parashaList = [];
        this.observer = null;
    }

    async init() {
        // Prevent running if API is missing (e.g. if you paste this in console)
        if (!browserAPI || !browserAPI.runtime) {
            console.error("ParashaBlocker: Extension API not found. Are you running this in the console?");
            return;
        }

        await this.loadBlockList();
        
        const hostname = window.location.hostname;
        
        if (hostname.includes("google")) {
            this.run(this.cleanGoogle);
        } else if (hostname.includes("bing")) {
            this.run(this.cleanBing);
        } else if (hostname.includes("duckduckgo")) {
            this.run(this.cleanDuckDuckGo);
        }
    }

    async loadBlockList() {
        try {
            const url = browserAPI.runtime.getURL('parashaList.txt');
            const response = await fetch(url);
            const text = await response.text();
            this.parashaList = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
        } catch (error) {
            console.error('ParashaBlocker: Failed to load list', error);
        }
    }

    handleLink(link, elementToRemove) {
        if (!link || !elementToRemove) return;
        
        if (this.parashaList.some(domain => link.includes(domain))) {
            elementToRemove.remove();
        }
    }

    cleanGoogle = () => {
        document.querySelectorAll(".MjjYud").forEach(block => {
            const linkEl = block.querySelector("a[href]");
            if (linkEl) this.handleLink(linkEl.href, block);
        });
    }

    cleanBing = () => {
        document.querySelectorAll(".b_algo").forEach(block => {
            const linkEl = block.querySelector("a");
            if (linkEl) this.handleLink(linkEl.href, block);
        });
    }

    cleanDuckDuckGo = () => {
        // Results
        // Google
        document.querySelectorAll('article').forEach(article => {
            const linkEl = article.querySelector('a[data-testid="result-title-a"]');
            if (linkEl) this.handleLink(linkEl.href, article);
        });

        // Firefox
        document.querySelectorAll('.veU5I0hFkgFGOPhX2RBE').forEach(result => {
            const text = result.querySelector("span").textContent.toLowerCase(); 
            
            if (this.parashaList.some(domain => text.includes(domain))) {
                const container = result.closest('article') || result.closest('li') || result;
                container.remove();
            }
        });

        // Images tab
        // Firefox
        document.querySelectorAll('.iHufrGzRLnW5Wh3koaLG').forEach(result => {
            const text = result.title
            
            if (this.parashaList.some(domain => text.includes(domain))) {
                const container = result.closest('article') || result.closest('li') || result;
                container.remove();
            }
        });
    }

    run(cleanFunction) {
        cleanFunction();
        this.observer = new MutationObserver(() => cleanFunction());
        this.observer.observe(document.body, { childList: true, subtree: true });
    }
}

const blocker = new ParashaBlocker();
blocker.init();