document.addEventListener("DOMContentLoaded", () => {
    const character = document.querySelector(".character");
    const hero = document.querySelector(".hero");
    const toast = document.getElementById("toast");
    const shareButtons = document.querySelectorAll(".share-trigger");

    setTimeout(() => {
        document.body.classList.add("wave-ready");
    }, 120);

    /* Character parallax */
    if (window.matchMedia("(pointer:fine)").matches && hero && character) {
        hero.addEventListener("pointermove", (e) => {
            const r = hero.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;

            if (!character.matches(":hover")) {
                character.style.transform =
                    `translate(${x * 5}px, ${y * -4}px) rotateY(${x * 2.5}deg)`;
            }
        });

        hero.addEventListener("pointerleave", () => {
            character.style.transform = "";
        });
    }

    /* Tap / click wave */
    if (character) {
        character.addEventListener("pointerdown", () => {
            character.classList.remove("tap-wave");
            void character.offsetWidth;
            character.classList.add("tap-wave");
        });

        character.addEventListener("animationend", () => {
            character.classList.remove("tap-wave");
        });
    }

    /* Scroll reveal */
    const items = document.querySelectorAll(".contact, .socials > a");

    items.forEach((el, i) => {
        el.classList.add("reveal");
        el.style.transitionDelay = `${Math.min(i * 0.07, 0.28)}s`;
    });

    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        io.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -30px 0px"
            }
        );

        items.forEach((item) => io.observe(item));
    } else {
        items.forEach((item) => item.classList.add("visible"));
    }

    /* Toast */
    const showToast = (message) => {
        if (!toast) return;

        const text = toast.querySelector("span");
        if (text) text.textContent = message;

        toast.classList.add("show");

        clearTimeout(window.__syniconToast);
        window.__syniconToast = setTimeout(() => {
            toast.classList.remove("show");
        }, 2400);
    };

    /* ---------------------------------------------------------
       SHARE
       1. Native share on supported mobile browsers.
       2. Clipboard API when available.
       3. Legacy textarea copy fallback.
       4. Last resort: open a small share URL / show URL.
    --------------------------------------------------------- */

    const getProfileUrl = () => {
        return window.location.href.split("#")[0];
    };

    const legacyCopy = (text) => {
        const textarea = document.createElement("textarea");

        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        let copied = false;

        try {
            copied = document.execCommand("copy");
        } catch (error) {
            copied = false;
        }

        textarea.remove();
        return copied;
    };

    const copyProfileLink = async () => {
        const url = getProfileUrl();

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
                showToast("Profile link copied");
                return true;
            }
        } catch (error) {
            /* Continue to legacy fallback */
        }

        if (legacyCopy(url)) {
            showToast("Profile link copied");
            return true;
        }

        showToast("Copy the profile link from your browser");
        return false;
    };

    const shareProfile = async () => {
        const shareData = {
            title: "Shraddha Jaybhave | Interior Designer",
            text: "Shraddha Jaybhave – Interior Designer",
            url: getProfileUrl()
        };

        /*
         * Native Web Share works mainly on HTTPS / supported mobile
         * browsers. It may throw AbortError when the user closes
         * the share sheet — that should NOT show an error.
         */
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (error) {
                if (error && error.name === "AbortError") {
                    return;
                }
                /* Fall through to copy */
            }
        }

        await copyProfileLink();
    };

    shareButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            shareProfile();
        });
    });
});
