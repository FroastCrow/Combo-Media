$(function () {
	const $body = $("body");
	const $menuToggle = $("#menu-toggle");
	const $mobileMenu = $(".overlay_top");
	const $overlay = $(".overlay");
	const $modals = $(".modal");
	const $topCta = $(".top-cta");

	function hasOpenModal() {
		return $modals.filter(".is-open").length > 0;
	}

	function hasOpenMenu() {
		return $mobileMenu.hasClass("open");
	}

	function syncOverlay() {
		if (hasOpenModal() || hasOpenMenu()) {
			$overlay.stop(true, true).fadeIn(200);
			return;
		}
		$overlay.stop(true, true).fadeOut(200);
	}

	function openMobileMenu() {
		$menuToggle.addClass("open");
		$mobileMenu.addClass("open");
		$body.addClass("non_scroll");
		syncOverlay();
	}

	function closeMobileMenu() {
		$menuToggle.removeClass("open");
		$mobileMenu.removeClass("open");
		$body.removeClass("non_scroll");
		syncOverlay();
	}

	function openModal(selector) {
		closeMobileMenu();
		$modals.removeClass("is-open").hide();
		$(selector).addClass("is-open").css("display", "flex").hide().fadeIn(200);
		syncOverlay();
	}

	function closeModal() {
		$modals.removeClass("is-open").fadeOut(200);
		syncOverlay();
	}

	$menuToggle.on("click", function () {
		const isOpen = !$mobileMenu.hasClass("open");
		if (isOpen) {
			openMobileMenu();
			return;
		}
		closeMobileMenu();
	});

	$(".mob-close").on("click", function () {
		closeMobileMenu();
	});

	$(".modal-search").on("click", function (event) {
		event.preventDefault();
		openModal("#modal-search");
	});

	$(".form_sign_in").on("click", function (event) {
		event.preventDefault();
		openModal("#sign_in_modal");
	});

	$(".form_sign_up").on("click", function (event) {
		event.preventDefault();
		openModal("#sign_up_modal");
	});

	$("[data-open-modal]").on("click", function (event) {
		const target = $(this).data("openModal");
		if (!target) {
			return;
		}
		event.preventDefault();
		openModal(target);
	});

	$(".modal_close").on("click", function () {
		closeModal();
	});

	$(".overlay").on("click", function () {
		closeModal();
		closeMobileMenu();
	});

	$("[data-close-modal]").on("click", function () {
		closeModal();
	});

	$(document).on("mouseup", function (event) {
		const $modalBody = $(".modal_main");
		if ($modalBody.is(":visible") && !$modalBody.is(event.target) && $modalBody.has(event.target).length === 0) {
			closeModal();
		}
	});

	$(".toggle-password").on("click", function () {
		const $trigger = $(this);
		const target = $trigger.data("target");
		const $input = $("#" + target);
		const nextType = $input.attr("type") === "password" ? "text" : "password";

		$input.attr("type", nextType);
		$trigger.toggleClass("show", nextType === "text");
	});

	const $termsCheckbox = $("#termsCheck");
	const $signUpSubmit = $("#sign_up_modal .form-group-btn .btn");

	if ($termsCheckbox.length && $signUpSubmit.length) {
		const syncSubmitState = () => {
			const isChecked = $termsCheckbox.is(":checked");
			$signUpSubmit.prop("disabled", !isChecked).toggleClass("is-disabled", !isChecked);
		};

		syncSubmitState();
		$termsCheckbox.on("change", syncSubmitState);
	}

	document.querySelectorAll(".auth-form .form-group").forEach((group) => {
		const marker = group.querySelector(".required-mark");
		const input = group.querySelector("input");

		if (!marker || !input) {
			return;
		}

		const placeholderText = (input.getAttribute("placeholder") || "").trim();
		if (!placeholderText) {
			return;
		}

		input.setAttribute("placeholder", "");

		if (!group.querySelector(".required-placeholder")) {
			const placeholder = document.createElement("span");
			placeholder.className = "required-placeholder";
			placeholder.setAttribute("aria-hidden", "true");
			placeholder.innerHTML = `<span>${placeholderText}</span><span class="required-placeholder__star">*</span>`;
			group.appendChild(placeholder);
		}

		const syncRequiredPlaceholder = () => {
			group.classList.toggle("has-value", input.value.trim().length > 0);
		};

		input.addEventListener("focus", () => {
			group.classList.add("is-focused");
		});

		input.addEventListener("blur", () => {
			group.classList.remove("is-focused");
			syncRequiredPlaceholder();
		});

		input.addEventListener("input", syncRequiredPlaceholder);
		syncRequiredPlaceholder();
	});

	const requiredFieldNames = new Set(["login", "password", "reset-email"]);
	const requiredErrorText = "заполните это поле";

	const isRequiredField = (group, input) => {
		return group.querySelector(".required-mark") || requiredFieldNames.has(input.name);
	};

	const setFieldError = (group, showError) => {
		let errorNode = group.querySelector(".auth-field-error");

		if (showError) {
			if (!errorNode) {
				errorNode = document.createElement("span");
				errorNode.className = "auth-field-error";
				errorNode.textContent = requiredErrorText;
				group.appendChild(errorNode);
			}
			group.classList.add("has-error");
			return;
		}

		group.classList.remove("has-error");
		if (errorNode) {
			errorNode.remove();
		}
	};

	document.querySelectorAll(".auth-form .form-group input").forEach((input) => {
		const group = input.closest(".form-group");
		if (!group || !isRequiredField(group, input)) {
			return;
		}

		input.addEventListener("input", () => {
			if (input.value.trim().length > 0) {
				setFieldError(group, false);
			}
		});
	});

	$(".auth-form").on("submit", function (event) {
		const form = event.currentTarget;
		const requiredInputs = Array.from(form.querySelectorAll(".form-group input"))
			.filter((input) => {
				const group = input.closest(".form-group");
				return group && isRequiredField(group, input);
			});

		let firstInvalidInput = null;

		requiredInputs.forEach((input) => {
			const group = input.closest(".form-group");
			const isEmpty = input.value.trim().length === 0;
			setFieldError(group, isEmpty);

			if (isEmpty && !firstInvalidInput) {
				firstInvalidInput = input;
			}
		});

		if (firstInvalidInput) {
			event.preventDefault();
			firstInvalidInput.focus();
			return;
		}

		if (form.classList.contains("reset-password-form")) {
			event.preventDefault();
			openModal("#reset_password_success_modal");
		}
	});

	$(".top-cta__close").on("click", function () {
		$topCta.slideUp(180);
	});

	$(".search-form").each(function () {
		const $form = $(this);
		const $input = $form.find('input[type="search"]');
		const $clear = $form.find(".search-form__clear");

		if (!$input.length || !$clear.length) {
			return;
		}

		const syncSearchState = () => {
			const hasValue = $input.val().trim().length > 0;
			$form.toggleClass("has-value", hasValue);
		};

		syncSearchState();

		$input.on("input", syncSearchState);

		$clear.on("click", function () {
			$input.val("");
			syncSearchState();
			$input.trigger("input");
			$input.trigger("focus");
		});
	});

	const sidebarSearchPanels = document.querySelectorAll(".sidebar-right .search-panel");

	sidebarSearchPanels.forEach((panel) => {
		const form = panel.querySelector(".search-form");
		const input = form ? form.querySelector('input[type="search"]') : null;

		if (!form || !input) {
			return;
		}

		const sourceCardSelectors = [
			".news-card",
			".training-card",
			".article-link-card",
			".conf-card",
			".conf-sponsor-card"
		];

		const sourceCards = Array.from(document.querySelectorAll(sourceCardSelectors.join(", ")))
			.filter((card) => {
				return !card.closest(".sidebar-right, .modal, .footer, .overlay_top");
			})
			.map((card) => {
				const isNewsCard = card.classList.contains("news-card");
				const titleNode = card.querySelector(".training-card__title")
					|| card.querySelector(".article-link-card__title")
					|| card.querySelector(".conf-sponsor-card__title")
					|| card.querySelector(".conf-card__copy h3")
					|| card.querySelector(".news-card__body > div")
					|| card.querySelector("h3");

				const title = titleNode ? titleNode.textContent.trim() : card.textContent.trim().split(/\s+/).slice(0, 8).join(" ");
				const rawText = card.textContent.replace(/\s+/g, " ").trim();
				const normalizedSearchText = rawText.toLowerCase();
				const excerpt = rawText.length > 140 ? `${rawText.slice(0, 140).trim()}...` : rawText;
				const linkNode = card.matches("a[href]") ? card : card.querySelector("a[href]");
				const href = linkNode ? (linkNode.getAttribute("href") || "").trim() : "";

				return {
					cardType: isNewsCard ? "news" : "default",
					sourceNode: card,
					title,
					excerpt,
					href,
					normalizedSearchText
				};
			})
			.filter((item) => item.normalizedSearchText.length > 0);

		const resultsRoot = document.createElement("div");
		resultsRoot.className = "sidebar-search-results";
		resultsRoot.hidden = true;
		resultsRoot.innerHTML = `
			<p class="sidebar-search-results__title">Результаты поиска</p>
			<div class="search-results" data-sidebar-search-results-list></div>
			<p class="sidebar-search-results__empty" data-sidebar-search-results-empty>Результаты не найдены</p>
			<button type="button" class="section-more sidebar-search-results__more" data-sidebar-search-results-more>Показать еще...</button>
		`;
		panel.insertAdjacentElement("afterend", resultsRoot);

		const resultsList = resultsRoot.querySelector("[data-sidebar-search-results-list]");
		const emptyState = resultsRoot.querySelector("[data-sidebar-search-results-empty]");
		const moreButton = resultsRoot.querySelector("[data-sidebar-search-results-more]");
		const maxVisibleResults = 5;
		let isExpanded = false;

		const renderSearchResults = () => {
			const query = input.value.trim().toLowerCase();

			if (!query) {
				resultsRoot.hidden = true;
				resultsList.innerHTML = "";
				emptyState.hidden = true;
				moreButton.hidden = true;
				isExpanded = false;
				return;
			}

			const matches = sourceCards.filter((item) => item.normalizedSearchText.includes(query));
			resultsRoot.hidden = false;
			resultsList.innerHTML = "";

			if (!matches.length) {
				emptyState.hidden = false;
				moreButton.hidden = true;
				return;
			}

			emptyState.hidden = true;
			const visibleMatches = isExpanded ? matches : matches.slice(0, maxVisibleResults);
			moreButton.hidden = isExpanded || matches.length <= maxVisibleResults;

			visibleMatches.forEach((item) => {
				if (item.cardType === "news" && item.sourceNode) {
					const newsCard = item.sourceNode.cloneNode(true);
					newsCard.classList.add("sidebar-search-results__item", "sidebar-search-results__item--news");
					resultsList.appendChild(newsCard);
					return;
				}

				const cardTag = item.href ? "a" : "div";
				const card = document.createElement(cardTag);
				card.className = "search-result-item sidebar-search-results__item";

				if (item.href) {
					card.setAttribute("href", item.href);
				}

				const title = document.createElement("h3");
				title.textContent = item.title;
				card.appendChild(title);

				if (item.excerpt) {
					const text = document.createElement("p");
					text.textContent = item.excerpt;
					card.appendChild(text);
				}

				resultsList.appendChild(card);
			});
		};

		moreButton.addEventListener("click", () => {
			isExpanded = true;
			renderSearchResults();
		});

		input.addEventListener("input", () => {
			isExpanded = false;
			renderSearchResults();
		});
	});

	$(".back-to-top").on("click", function (event) {
		event.preventDefault();
		window.scrollTo({ top: 0, behavior: "smooth" });
	});

	const commentsSorts = document.querySelectorAll("[data-comments-sort]");

	commentsSorts.forEach((sortRoot) => {
		const toggle = sortRoot.querySelector(".article-comments__sort-toggle");
		const value = sortRoot.querySelector(".article-comments__sort-value");
		const items = Array.from(sortRoot.querySelectorAll(".article-comments__sort-item"));

		if (!toggle || !value || !items.length) {
			return;
		}

		const closeSort = () => {
			sortRoot.classList.remove("is-open");
			toggle.setAttribute("aria-expanded", "false");
		};

		toggle.addEventListener("click", () => {
			const willOpen = !sortRoot.classList.contains("is-open");
			document.querySelectorAll("[data-comments-sort].is-open").forEach((opened) => {
				opened.classList.remove("is-open");
				const openedToggle = opened.querySelector(".article-comments__sort-toggle");
				if (openedToggle) {
					openedToggle.setAttribute("aria-expanded", "false");
				}
			});
			sortRoot.classList.toggle("is-open", willOpen);
			toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
		});

		items.forEach((item) => {
			item.addEventListener("click", () => {
				items.forEach((button) => {
					button.classList.remove("is-active");
					button.setAttribute("aria-selected", "false");
				});
				item.classList.add("is-active");
				item.setAttribute("aria-selected", "true");
				value.textContent = item.textContent.trim();
				closeSort();
			});
		});

		document.addEventListener("click", (event) => {
			if (!sortRoot.contains(event.target)) {
				closeSort();
			}
		});
	});

	const confHeaderNavLinks = Array.from(document.querySelectorAll(".conf-header-menu__item[href^='#']"));

	if (confHeaderNavLinks.length) {
		const confHeaderNavItems = confHeaderNavLinks
			.map((link) => {
				const targetSelector = link.getAttribute("href");
				const section = targetSelector ? document.querySelector(targetSelector) : null;
				return section ? { link, targetSelector, section } : null;
			})
			.filter(Boolean);

		const setConfActiveLink = (targetSelector) => {
			confHeaderNavItems.forEach(({ link, targetSelector: selector }) => {
				link.classList.toggle("side-menu__item--active", selector === targetSelector);
			});
		};

		const getConfScrollOffset = () => {
			const header = document.querySelector(".header");
			return (header ? header.offsetHeight : 0) + 18;
		};

		const syncConfNavByScroll = () => {
			const scrollOffset = getConfScrollOffset();
			let activeItem = confHeaderNavItems[0] || null;

			confHeaderNavItems.forEach((item) => {
				const sectionTop = item.section.getBoundingClientRect().top - scrollOffset;
				if (sectionTop <= 0) {
					activeItem = item;
				}
			});

			if (activeItem) {
				setConfActiveLink(activeItem.targetSelector);
			}
		};

		confHeaderNavItems.forEach(({ link, section, targetSelector }) => {
			link.addEventListener("click", (event) => {
				event.preventDefault();
				const targetTop = window.scrollY + section.getBoundingClientRect().top - getConfScrollOffset();
				setConfActiveLink(targetSelector);
				window.scrollTo({
					top: Math.max(0, targetTop),
					behavior: "smooth",
				});
				closeMobileMenu();
			});
		});

		let confNavRaf = null;
		const scheduleConfNavSync = () => {
			if (confNavRaf) {
				return;
			}
			confNavRaf = requestAnimationFrame(() => {
				confNavRaf = null;
				syncConfNavByScroll();
			});
		};

		window.addEventListener("scroll", scheduleConfNavSync, { passive: true });
		window.addEventListener("resize", scheduleConfNavSync);
		window.addEventListener("load", syncConfNavByScroll);

		const hashMatch = confHeaderNavItems.find(({ targetSelector }) => targetSelector === window.location.hash);
		if (hashMatch) {
			setConfActiveLink(hashMatch.targetSelector);
		} else {
			syncConfNavByScroll();
			}
		}

		const confPromoRoots = document.querySelectorAll(".conf-promo");

		confPromoRoots.forEach((promo) => {
			const tabs = Array.from(promo.querySelectorAll("[data-conf-promo-tab]"));
			const title = promo.querySelector("[data-conf-promo-title]");
			const description = promo.querySelector("[data-conf-promo-description]");
			const button = promo.querySelector("[data-conf-promo-button]");
			const mediaImage = promo.querySelector("[data-conf-promo-media-image]");
			let requestedMediaSrc = "";

			if (!tabs.length || !title || !description || !button) {
				return;
			}

			tabs.forEach((tab) => {
				const tabMediaImage = tab.dataset.mediaImage;
				if (tabMediaImage) {
					const preloadImage = new Image();
					preloadImage.src = tabMediaImage;
				}
			});

			const setPromoContent = (tab) => {
				const nextTitle = tab.dataset.title;
				const nextDescription = tab.dataset.description;
				const nextButtonText = tab.dataset.buttonText;
				const nextButtonHref = tab.dataset.buttonHref;
				const nextBackgroundImage = tab.dataset.bgImage;
				const nextMediaImage = tab.dataset.mediaImage;
				const shouldTiltMedia = tab.dataset.mediaTilt === "true";

				if (nextTitle) {
					title.textContent = nextTitle;
				}

				if (nextDescription) {
					description.textContent = nextDescription;
				}

				if (nextButtonText) {
					button.textContent = nextButtonText;
				}

				if (nextButtonHref) {
					button.setAttribute("href", nextButtonHref);
				}

				if (nextBackgroundImage) {
					promo.style.backgroundImage = `url('${nextBackgroundImage}')`;
				}

				if (nextMediaImage && mediaImage) {
					requestedMediaSrc = nextMediaImage;
					const applyMediaImage = () => {
						if (requestedMediaSrc !== nextMediaImage) {
							return;
						}
						mediaImage.setAttribute("src", nextMediaImage);
						mediaImage.classList.toggle("conf-promo__image--tilted", shouldTiltMedia);
					};

					const preloadImage = new Image();
					preloadImage.src = nextMediaImage;

					if (preloadImage.complete) {
						applyMediaImage();
					} else {
						preloadImage.addEventListener("load", applyMediaImage, { once: true });
					}
				}
			};

			tabs.forEach((tab) => {
				tab.addEventListener("click", (event) => {
					event.preventDefault();
					tabs.forEach((item) => item.classList.remove("is-active"));
					tab.classList.add("is-active");
					setPromoContent(tab);
				});
			});

			const activeTab = tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0];
			if (activeTab) {
				setPromoContent(activeTab);
			}
		});

		const canHoverSpeakerPreview = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
		const confSpeakersRoots = document.querySelectorAll(".conf-speakers");

		if (canHoverSpeakerPreview && confSpeakersRoots.length) {
			confSpeakersRoots.forEach((speakersRoot) => {
				const rows = Array.from(speakersRoot.querySelectorAll(".conf-speaker-row"));
				const preview = speakersRoot.querySelector("[data-speaker-preview]");
				const previewVideo = preview ? preview.querySelector(".conf-speaker-preview__video") : null;
				let currentSrc = "";
				let rafId = null;
				let pointerX = 0;
				let pointerY = 0;

				if (!rows.length || !preview || !previewVideo) {
					return;
				}

				const getConstrainedPosition = (x, y) => {
					const offset = 18;
					const maxX = Math.max(8, window.innerWidth - preview.offsetWidth - 8);
					const maxY = Math.max(8, window.innerHeight - preview.offsetHeight - 8);
					const nextX = Math.min(maxX, Math.max(8, x + offset));
					const nextY = Math.min(maxY, Math.max(8, y + offset));
					return { x: nextX, y: nextY };
				};

				const syncPreviewPosition = () => {
					rafId = null;
					const position = getConstrainedPosition(pointerX, pointerY);
					preview.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
				};

				const schedulePreviewPosition = () => {
					if (rafId) {
						return;
					}
					rafId = requestAnimationFrame(syncPreviewPosition);
				};

				const hidePreview = () => {
					if (rafId) {
						cancelAnimationFrame(rafId);
						rafId = null;
					}
					preview.classList.remove("is-visible");
					previewVideo.pause();
				};

				const showPreviewForRow = (row) => {
					const nextSrc = row.dataset.previewVideo;
					if (!nextSrc) {
						hidePreview();
						return;
					}

					if (currentSrc !== nextSrc) {
						currentSrc = nextSrc;
						previewVideo.setAttribute("src", nextSrc);
						previewVideo.load();
					}

					preview.classList.add("is-visible");
					const playPromise = previewVideo.play();
					if (playPromise && typeof playPromise.catch === "function") {
						playPromise.catch(() => {});
					}
				};

				rows.forEach((row) => {
					row.addEventListener("pointerenter", (event) => {
						pointerX = event.clientX;
						pointerY = event.clientY;
						schedulePreviewPosition();
						showPreviewForRow(row);
					});
				});

				speakersRoot.addEventListener("pointermove", (event) => {
					pointerX = event.clientX;
					pointerY = event.clientY;
					schedulePreviewPosition();
				});

				speakersRoot.addEventListener("pointerleave", () => {
					hidePreview();
				});
			});
		}

		const watchBoxes = document.querySelectorAll("[data-watch-box]");

		watchBoxes.forEach((watchBox) => {
			const playButton = watchBox.querySelector("[data-watch-play]");
			const video = watchBox.querySelector("[data-watch-video]");

			if (!playButton || !video) {
				return;
			}

			const syncWatchBoxState = () => {
				const isPlaying = !video.paused && !video.ended;
				watchBox.classList.toggle("is-playing", isPlaying);
			};

			playButton.addEventListener("click", () => {
				if (video.paused || video.ended) {
					const playPromise = video.play();
					if (playPromise && typeof playPromise.catch === "function") {
						playPromise.catch(() => {});
					}
					return;
				}

				video.pause();
			});

			video.addEventListener("play", syncWatchBoxState);
			video.addEventListener("pause", syncWatchBoxState);
			video.addEventListener("ended", syncWatchBoxState);
			syncWatchBoxState();
		});

		const tickerSpeed = 90;
		const tickerRoots = document.querySelectorAll(".ticker__slider");
	const heroSliders = document.querySelectorAll(".hero-slider");
	const materialsSliders = document.querySelectorAll("[data-materials-slider]");

	heroSliders.forEach((slider) => {
		const slides = Array.from(slider.querySelectorAll(".hero-slide"));
		const progressRoot = slider.querySelector(".hero-slider__progress");
		const duration = Number(slider.dataset.sliderDuration) || 5000;
		const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
		let activeIndex = 0;
		let animationFrame = null;
		let timeoutId = null;
		let progressItems = [];

		if (!slides.length || !progressRoot) {
			return;
		}

		progressRoot.innerHTML = "";
		progressItems = slides.map((_, index) => {
			const item = document.createElement("span");
			item.className = "hero-slider__progress-item";
			if (index === 0) {
				item.classList.add("is-active");
			}

			const fill = document.createElement("span");
			fill.className = "hero-slider__progress-fill";
			item.appendChild(fill);
			progressRoot.appendChild(item);
			return item;
		});

		const stopProgressAnimation = () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
				animationFrame = null;
			}
			if (timeoutId) {
				window.clearTimeout(timeoutId);
				timeoutId = null;
			}
		};

		const setProgress = (index, value) => {
			const fill = progressItems[index]?.querySelector(".hero-slider__progress-fill");
			if (!fill) {
				return;
			}

			fill.style.transform = `scaleX(${Math.min(Math.max(value, 0), 1)})`;
		};

		const render = (index) => {
			slides.forEach((slide, slideIndex) => {
				slide.classList.toggle("is-active", slideIndex === index);
			});

			progressItems.forEach((item, itemIndex) => {
				item.classList.toggle("is-active", itemIndex === index);
				setProgress(itemIndex, itemIndex < index ? 1 : 0);
			});
		};

		const schedule = () => {
			stopProgressAnimation();

			if (prefersReduced.matches) {
				setProgress(activeIndex, 1);
				timeoutId = window.setTimeout(() => {
					activeIndex = (activeIndex + 1) % slides.length;
					render(activeIndex);
					schedule();
				}, duration);
				return;
			}

			const start = performance.now();

			const step = (timestamp) => {
				const progress = (timestamp - start) / duration;
				setProgress(activeIndex, progress);

				if (progress >= 1) {
					activeIndex = (activeIndex + 1) % slides.length;
					render(activeIndex);
					schedule();
					return;
				}

				animationFrame = requestAnimationFrame(step);
			};

			animationFrame = requestAnimationFrame(step);
		};

		render(activeIndex);
		schedule();

		document.addEventListener("visibilitychange", () => {
			if (document.hidden) {
				stopProgressAnimation();
				return;
			}

			render(activeIndex);
			schedule();
		});
	});

	materialsSliders.forEach((slider) => {
		const viewport = slider.querySelector(".materials-slider__viewport");
		const prevButton = slider.querySelector(".materials-slider__prev");
		const nextButton = slider.querySelector(".materials-slider__next");

		if (!viewport || !prevButton || !nextButton || typeof Swiper === "undefined") {
			return;
		}

		prevButton.style.display = "none";
		nextButton.style.display = "none";

		const swiper = new Swiper(viewport, {
			slidesPerView: "auto",
			spaceBetween: 12,
			loop: false,
			watchOverflow: true,
			speed: 450,
			breakpoints: {
				0: {
					spaceBetween: 12,
				},
				901: {
					spaceBetween: 12,
				},
			},
		});

		const syncMaterialsNav = () => {
			const isLocked = Boolean(swiper.isLocked);
			const canGoPrev = !isLocked && !swiper.isBeginning;
			const canGoNext = !isLocked && !swiper.isEnd;

			prevButton.style.display = canGoPrev ? "flex" : "none";
			nextButton.style.display = canGoNext ? "flex" : "none";
		};

		swiper.on("init", syncMaterialsNav);
		swiper.on("slideChange", syncMaterialsNav);
		swiper.on("lock", syncMaterialsNav);
		swiper.on("unlock", syncMaterialsNav);
		swiper.on("reachBeginning", syncMaterialsNav);
		swiper.on("reachEnd", syncMaterialsNav);
		swiper.on("fromEdge", syncMaterialsNav);
		swiper.on("resize", syncMaterialsNav);
		swiper.on("update", syncMaterialsNav);
		syncMaterialsNav();

		nextButton.addEventListener("click", () => {
			if (!swiper.isEnd) {
				swiper.slideNext();
			}
		});

		prevButton.addEventListener("click", () => {
			if (!swiper.isBeginning) {
				swiper.slidePrev();
			}
		});
	});

	tickerRoots.forEach((root) => {
		const track = root.querySelector(".ticker__track");
		const group = root.querySelector(".ticker__group");
		if (!track || !group) {
			return;
		}

		let offset = 0;
		let lastTime = null;
		let baseWidth = 0;
		let rafResize = null;
		const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

		const outerWidth = (element) => {
			const style = getComputedStyle(element);
			return element.offsetWidth
				+ (parseFloat(style.marginLeft) || 0)
				+ (parseFloat(style.marginRight) || 0);
		};

		const build = () => {
			track.querySelectorAll(".ticker__group--clone").forEach((node) => node.remove());

			baseWidth = outerWidth(group) || 0;
			if (!baseWidth) {
				requestAnimationFrame(build);
				return;
			}

			const viewportWidth = root.offsetWidth || 0;
			let totalWidth = baseWidth;

			while (totalWidth < viewportWidth + baseWidth) {
				const clone = group.cloneNode(true);
				clone.classList.add("ticker__group--clone");
				clone.setAttribute("aria-hidden", "true");
				track.appendChild(clone);
				totalWidth += baseWidth;
			}

			offset = offset % baseWidth;
			track.style.transform = `translateX(${offset}px)`;
		};

		const animate = (time) => {
			if (prefersReduced.matches) {
				return;
			}

			if (!lastTime) {
				lastTime = time;
			}

			const delta = (time - lastTime) / 1000;
			lastTime = time;

			if (baseWidth) {
				offset -= tickerSpeed * delta;
				if (offset <= -baseWidth) {
					offset += baseWidth;
				}
				track.style.transform = `translateX(${offset}px)`;
			}

			requestAnimationFrame(animate);
		};

		requestAnimationFrame(build);
		requestAnimationFrame(animate);

		window.addEventListener("load", build);
		window.addEventListener("orientationchange", build);
		window.addEventListener("resize", () => {
			if (rafResize) {
				cancelAnimationFrame(rafResize);
			}
			rafResize = requestAnimationFrame(build);
		});
	});

	$(window).on("resize", function () {
		if (window.innerWidth > 900) {
			closeMobileMenu();
		}
	});

	const sectionMoreConfigs = {
		playlist: {
			containerSelector: ".playlist",
			items: [
				{ title: "Как управлять офферами за 30 минут", author: "Combo.team", views: "92 314", comments: "248", likes: "3 140" },
				{ title: "Проверенные триггеры и креативы", author: "Marketing Lab", views: "71 004", comments: "112", likes: "2 430" },
				{ title: "Аналитика кампаний: что смотреть", author: "DataOps", views: "64 899", comments: "98", likes: "1 907" },
			],
			renderItem: (item) => {
				const node = document.createElement("a");
				node.href = "#";
				node.className = "playlist-item";
				node.innerHTML = `
					<div class="playlist-item__play icon-placeholder">icon</div>
					<div class="playlist-item__content">
						<div class="playlist-item__content-title">${item.title}</div>
						<p class="playlist-item-author">${item.author}</p>
					</div>
					<div class="playlist-item__stats">
						<span class="stat stat--views">${item.views}</span>
						<span class="stat stat--comments">${item.comments}</span>
						<span class="stat stat--likes">${item.likes}</span>
					</div>
					<div class="playlist-item__arrow" aria-hidden="true"></div>
				`;
				return node;
			},
		},
		"news-grid": {
			containerSelector: ".news-grid",
			items: [
				{ image: "img/back1.webp", alt: "", author: "Combo Daily", title: "Арбитражный рынок меняется быстрее, чем медиабаинг-команды успевают адаптироваться", views: "98 402", comments: "214", likes: "3 876", dateTime: "2026-02-03", dateLabel: "03.02.2026", mediaAlt: true },
				{ image: "img/back2.webp", alt: "", author: "Affiliate Desk", title: "Почему Telegram-воронки снова становятся главным источником прогрева аудитории", views: "76 190", comments: "163", likes: "2 741", dateTime: "2026-02-08", dateLabel: "08.02.2026", mediaAlt: false },
				{ image: "img/back.webp", alt: "", author: "Combo Media", title: "Что происходит с CPM в tier-1 и как это влияет на запуск новых офферов", views: "84 557", comments: "187", likes: "3 024", dateTime: "2026-02-11", dateLabel: "11.02.2026", mediaAlt: true },
				{ image: "img/back2.webp", alt: "", author: "Traffic Notes", title: "Какие вертикали показывают лучший ROI в начале квартала по данным команд", views: "68 931", comments: "129", likes: "2 205", dateTime: "2026-02-14", dateLabel: "14.02.2026", mediaAlt: false },
			],
			renderItem: (item) => {
				const node = document.createElement("a");
				node.href = "#";
				node.className = "news-card";
				node.innerHTML = `
					<div class="news-card__inner">
						<div class="news-card__media${item.mediaAlt ? " news-card__media--alt" : ""} media-placeholder"><img src="${item.image}" alt="${item.alt}"></div>
						<div class="news-card__body">
							<p class="news-card__author"><span>${item.author}</span></p>
							<div>${item.title}</div>
							<div class="news-card__stats">
								<span class="stat stat--views">${item.views}</span>
								<span class="stat stat--comments">${item.comments}</span>
								<span class="stat stat--likes">${item.likes}</span>
								<time datetime="${item.dateTime}">${item.dateLabel}</time>
							</div>
						</div>
					</div>
				`;
				return node;
			},
		},
		"conf-sponsors-grid": {
			containerSelector: ".conf-sponsors-grid",
			items: [
				{ title: "AdCombo – нутровая ПП", text: "Лучшие нутровые офферы для тебя и твоего трафика", accent: false, image: "img/back.webp" },
				{ title: "VISION – лучший антидетект браузер", text: "Мы лучший антик от лучшего антика", accent: false, image: "img/back2.webp" },
				{ title: "VISION – лучший антидетект браузер", text: "Мы лучший антик от лучшего антика", accent: false, image: "img/back1.webp" },
				{ title: "AdCombo – нутровая ПП", text: "Лучшие нутровые офферы для тебя и твоего трафика", accent: false, image: "img/card-img1.webp" },
				{ title: "VISION – лучший антидетект браузер", text: "Мы лучший антик от лучшего антика", accent: false, image: "img/card-img2.webp" },
				{ title: "VISION – лучший антидетект браузер", text: "Мы лучший антик от лучшего антика", accent: false, image: "img/card-img3.webp" },
			],
			renderItem: (item) => {
				const node = document.createElement("article");
				node.className = `conf-sponsor-card${item.accent ? " is-accent" : ""}`;
				node.innerHTML = `
					<div class="conf-sponsor-card__media media-placeholder"><img src="${item.image}" alt="Спонсор"></div>
					<div class="conf-sponsor-card__body">
						<div class="conf-sponsor-card__title">${item.title}</div>
						<p>${item.text}</p>
						<a href="#" class="btn ${item.accent ? "btn--gradient" : "btn-dark"}">Перейти на сайт</a>
					</div>
				`;
				return node;
			},
		},
	};

	document.querySelectorAll(".section-more[data-target]").forEach((button) => {
		const target = button.dataset.target;
		const config = sectionMoreConfigs[target];
		const section = button.closest(".content-section") || document;
		const container = config ? section.querySelector(config.containerSelector) : null;

		if (!config || !container) {
			return;
		}

		button.addEventListener("click", (event) => {
			event.preventDefault();

			const fragment = document.createDocumentFragment();

			config.items.forEach((item) => {
				fragment.appendChild(config.renderItem(item));
			});

			if (button.parentElement === container) {
				container.insertBefore(fragment, button);
			} else {
				container.appendChild(fragment);
			}

			button.remove();
		});
	});

	document.querySelectorAll("[data-news-tabs]").forEach((tabs) => {
		if (tabs.querySelector("[data-education-filter]")) {
			return;
		}

		const section = tabs.closest(".content-section");
		const grid = section ? section.querySelector(".news-grid") : null;
		const moreButton = section ? section.querySelector("[data-news-more]") : null;
		const cards = grid ? Array.from(grid.querySelectorAll(".news-card")) : [];
		const filterButtons = Array.from(tabs.querySelectorAll("[data-news-filter]"));
		const initialVisible = 8;
		const step = 4;
		let activeFilter = "all";
		let visibleCount = initialVisible;

		if (!grid || !cards.length || !filterButtons.length) {
			return;
		}

		const renderNewsFeed = () => {
			const matchingCards = cards.filter((card) => activeFilter === "all" || card.dataset.category === activeFilter);

			cards.forEach((card) => {
				card.hidden = !matchingCards.includes(card);
			});

			matchingCards.forEach((card, index) => {
				card.hidden = index >= visibleCount;
			});

			if (moreButton) {
				moreButton.hidden = matchingCards.length <= visibleCount;
			}
		};

		filterButtons.forEach((button) => {
			button.addEventListener("click", () => {
				activeFilter = button.dataset.newsFilter || "all";
				visibleCount = initialVisible;

				filterButtons.forEach((item) => {
					item.classList.toggle("is-active", item === button);
				});

				renderNewsFeed();
			});
		});

		if (moreButton) {
			moreButton.addEventListener("click", (event) => {
				event.preventDefault();
				visibleCount += step;
				renderNewsFeed();
			});
		}

		renderNewsFeed();
	});

	const educationFeed = document.querySelector("[data-education-feed]");
	const educationTabs = Array.from(document.querySelectorAll("[data-education-filter]"));

	if (educationFeed && educationTabs.length) {
		const educationPanels = Array.from(educationFeed.querySelectorAll("[data-education-panel]"));

		educationTabs.forEach((button) => {
			button.addEventListener("click", () => {
				const filter = button.dataset.educationFilter || "facebook";
				educationTabs.forEach((item) => {
					item.classList.toggle("is-active", item === button);
				});
				educationPanels.forEach((panel) => {
					panel.hidden = panel.dataset.educationPanel !== filter;
				});
			});
		});
	}

	const personalPageRoot = document.querySelector(".personal-page");
	const personalPageForm = personalPageRoot ? personalPageRoot.querySelector(".personal-page__form") : null;

	if (personalPageRoot && personalPageForm) {
		const avatar = personalPageRoot.querySelector(".personal-page__avatar img");
		const avatarEditButton = personalPageRoot.querySelector(".personal-page__avatar-edit");
		const avatarUploadTrigger = personalPageRoot.querySelector(".personal-page__logout");
		const fieldIcons = Array.from(personalPageRoot.querySelectorAll(".personal-page__field-icon"));
		const fields = Array.from(personalPageForm.querySelectorAll(".form-group input"));
		const resetButton = personalPageForm.querySelector('button[type="reset"]');
		const submitButton = personalPageForm.querySelector('button[type="submit"]');

		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept = "image/*";
		fileInput.hidden = true;
		personalPageRoot.appendChild(fileInput);

		let avatarSavedSrc = avatar ? avatar.getAttribute("src") || "" : "";
		let commentsDirty = false;

		const savedValues = new Map();
		fields.forEach((field) => {
			savedValues.set(field, field.value);
		});

		const syncButtonsState = () => {
			const formDirty = fields.some((field) => field.value !== (savedValues.get(field) || ""));
			const avatarDirty = !!avatar && (avatar.getAttribute("src") || "") !== avatarSavedSrc;
			const pageDirty = formDirty || avatarDirty || commentsDirty;

			if (resetButton) {
				resetButton.disabled = !formDirty;
				resetButton.classList.toggle("is-disabled", !formDirty);
			}

			if (submitButton) {
				submitButton.disabled = !pageDirty;
				submitButton.classList.toggle("is-disabled", !pageDirty);
			}
		};

		fields.forEach((field) => {
			field.readOnly = true;
			field.classList.add("personal-page__input--locked");
		});

		fieldIcons.forEach((icon) => {
			const group = icon.closest(".form-group");
			const input = group ? group.querySelector("input") : null;
			if (!input) {
				return;
			}

			icon.addEventListener("click", () => {
				const willUnlock = input.readOnly;
				input.readOnly = !willUnlock;
				input.classList.toggle("personal-page__input--locked", !willUnlock);
				icon.classList.toggle("personal-page__field-icon--active", willUnlock);

				if (willUnlock) {
					input.focus();
					const valueLength = input.value.length;
					input.setSelectionRange(valueLength, valueLength);
				} else {
					input.blur();
				}
			});
		});

		fields.forEach((field) => {
			field.addEventListener("input", syncButtonsState);
		});

		const openFileDialog = (event) => {
			if (event) {
				event.preventDefault();
			}
			fileInput.click();
		};

		if (avatarEditButton) {
			avatarEditButton.addEventListener("click", openFileDialog);
		}
		if (avatarUploadTrigger) {
			avatarUploadTrigger.addEventListener("click", openFileDialog);
		}

		fileInput.addEventListener("change", () => {
			const [file] = fileInput.files || [];
			if (!file || !avatar) {
				return;
			}

			const objectUrl = URL.createObjectURL(file);
			avatar.setAttribute("src", objectUrl);
			syncButtonsState();
		});

		personalPageForm.addEventListener("reset", (event) => {
			event.preventDefault();
			fields.forEach((field) => {
				field.value = "";
			});
			syncButtonsState();
		});

		personalPageForm.addEventListener("submit", (event) => {
			event.preventDefault();
			fields.forEach((field) => {
				savedValues.set(field, field.value);
			});
			if (avatar) {
				avatarSavedSrc = avatar.getAttribute("src") || "";
			}
			commentsDirty = false;
			syncButtonsState();
		});

		personalPageRoot.addEventListener("click", (event) => {
			const removeButton = event.target.closest(".personal-page__comment-remove");
			if (!removeButton) {
				return;
			}

			const commentItem = removeButton.closest(".personal-page__comment-item");
			if (commentItem) {
				commentItem.remove();
				commentsDirty = true;
				syncButtonsState();
			}
		});

		syncButtonsState();
	}
});

window.addEventListener("load", () => {
	const mobileSpeakerMediaQuery = window.matchMedia("(max-width: 900px)");
	const mobileSpeakerRows = document.querySelectorAll(".conf-speaker-row");

	if (!mobileSpeakerMediaQuery.matches || !mobileSpeakerRows.length || !("IntersectionObserver" in window)) {
		return;
	}

	const mobileVideoItems = Array.from(mobileSpeakerRows)
		.map((row) => ({
			row,
			video: row.querySelector(".conf-speaker-row__mobile-video-player"),
		}))
		.filter(({ video }) => !!video);

	if (!mobileVideoItems.length) {
		return;
	}

	const stopVideo = (video) => {
		video.pause();
		video.currentTime = 0;
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			const video = entry.target.querySelector(".conf-speaker-row__mobile-video-player");
			if (!video) {
				return;
			}

			if (entry.isIntersecting) {
				const playPromise = video.play();
				if (playPromise && typeof playPromise.catch === "function") {
					playPromise.catch(() => {});
				}
			} else {
				stopVideo(video);
			}
		});
	}, {
		threshold: 0.6,
	});

	mobileVideoItems.forEach(({ row }) => observer.observe(row));
});
