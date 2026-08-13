document.addEventListener('DOMContentLoaded', () => {

    let uploadedImages = [];
    let editingListingId = null;

    const listingForm = document.getElementById('listing-form');
    const titleInput = document.getElementById('item-title');
    const categorySelect = document.getElementById('item-category');
    const priceInput = document.getElementById('item-price');
    const pricePeriodSelect = document.getElementById('item-period');
    const descInput = document.getElementById('item-desc');
    const sellerNameInput = document.getElementById('seller-name');
    const sellerPhoneInput = document.getElementById('seller-phone');
    const sellerCityInput = document.getElementById('seller-city');
    const autoRenewCheck = document.getElementById('auto-renew');

    const previewTitle = document.getElementById('prev-title');
    const previewCategory = document.getElementById('prev-category');
    const previewPrice = document.getElementById('prev-price');
    const previewPeriod = document.getElementById('prev-period');
    const previewDesc = document.getElementById('prev-desc');
    const previewSellerName = document.getElementById('prev-seller-name');
    const previewSellerCity = document.getElementById('prev-seller-city');
    const previewAvatar = document.getElementById('prev-avatar');
    const previewImg = document.getElementById('prev-img');
    const previewSecurity = document.getElementById('prev-security');

    const calcUserPrice = document.getElementById('calc-user-price');
    const calcCommission = document.getElementById('calc-commission');
    const calcSecurity = document.getElementById('calc-security');
    const calcNet = document.getElementById('calc-net');

    const dropzone = document.getElementById('dropzone');
    const imageInput = document.getElementById('image-input');
    const previewGrid = document.getElementById('image-preview-grid');

    const duplicateWarning = document.getElementById('duplicate-warning');

    initSellerDetails();

    [titleInput, categorySelect, priceInput, pricePeriodSelect, descInput, sellerNameInput, sellerCityInput].forEach(el => {
        if (el) {
            el.addEventListener('input', updateLivePreviewAndCalculator);
            el.addEventListener('change', updateLivePreviewAndCalculator);
        }
    });

    if (titleInput) {
        titleInput.addEventListener('blur', checkForDuplicateListing);
    }

    setupImageUpload();

    if (listingForm) {
        listingForm.addEventListener('submit', handleFormSubmit);
    }

    updateLivePreviewAndCalculator();
    renderMyListingsDashboard();

    function updateLivePreviewAndCalculator() {
        const title = titleInput.value.trim() || 'Your Product Name';
        const category = categorySelect.value || 'General';
        const rawPrice = parseFloat(priceInput.value) || 0;
        const period = pricePeriodSelect.value || 'day';
        const desc = descInput.value.trim() || 'Provide a detailed description of your item to attract potential lenders/renters.';
        const sellerName = sellerNameInput.value.trim() || 'John Doe (Seller)';
        const sellerCity = sellerCityInput.value.trim() || 'Mumbai, IN';

        previewTitle.textContent = title;
        previewCategory.textContent = category.toUpperCase();
        previewPrice.textContent = '₹' + rawPrice.toLocaleString('en-IN');
        previewPeriod.textContent = period;
        previewDesc.textContent = desc;
        previewSellerName.textContent = sellerName;
        previewSellerCity.textContent = sellerCity;

        const initial = sellerName.charAt(0).toUpperCase() || 'S';
        previewAvatar.textContent = initial;

        const commission = Math.round(rawPrice * 0.02);
        const security = Math.round(rawPrice * 0.10);
        const netEarnings = Math.max(0, rawPrice - commission);

        calcUserPrice.textContent = '₹' + rawPrice.toLocaleString('en-IN');
        calcCommission.textContent = '- ₹' + commission.toLocaleString('en-IN');
        calcSecurity.textContent = '₹' + security.toLocaleString('en-IN');
        calcNet.textContent = '₹' + netEarnings.toLocaleString('en-IN');
        previewSecurity.textContent = 'Deposit: ₹' + security.toLocaleString('en-IN');
    }

    function setupImageUpload() {
        if (!dropzone || !imageInput) return;

        dropzone.addEventListener('click', () => imageInput.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });

        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
            }
        });

        imageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files);
            }
        });
    }

    function handleFiles(files) {
        const remainingSlots = 4 - uploadedImages.length;
        if (remainingSlots <= 0) {
            alert('Maximum 4 images allowed per listing.');
            return;
        }

        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            if (!file.type.startsWith('image/')) {
                alert('Please upload valid image files (PNG, JPG, WEBP).');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImages.push(e.target.result);
                renderImagePreviews();
            };
            reader.readAsDataURL(file);
        });
    }

    function renderImagePreviews() {
        previewGrid.innerHTML = '';

        if (uploadedImages.length > 0) {
            previewImg.src = uploadedImages[0];
        } else {
            previewImg.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
        }

        uploadedImages.forEach((imgSrc, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'image-preview-thumb';
            thumb.innerHTML = `
                <img src="${imgSrc}" alt="Preview ${index + 1}" />
                <button type="button" class="remove-img-btn" data-index="${index}">&times;</button>
                ${index === 0 ? '<span class="primary-badge-tag">Cover</span>' : ''}
            `;

            thumb.querySelector('.remove-img-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                uploadedImages.splice(index, 1);
                renderImagePreviews();
            });

            previewGrid.appendChild(thumb);
        });
    }

    function checkForDuplicateListing() {
        const title = titleInput.value.trim().toLowerCase();
        if (!title) {
            duplicateWarning.style.display = 'none';
            duplicateWarning.classList.remove('show');
            return;
        }

        const existingListings = getStoredListings();
        const isDuplicate = existingListings.some(item => 
            item.title.toLowerCase() === title && item.id !== editingListingId
        );

        if (isDuplicate) {
            duplicateWarning.style.display = 'flex';
            duplicateWarning.classList.add('show');
        } else {
            duplicateWarning.style.display = 'none';
            duplicateWarning.classList.remove('show');
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        const title = titleInput.value.trim();
        const category = categorySelect.value;
        const price = parseFloat(priceInput.value);
        const period = pricePeriodSelect.value;
        const desc = descInput.value.trim();
        const sellerName = sellerNameInput.value.trim();
        const sellerPhone = sellerPhoneInput.value.trim();
        const sellerCity = sellerCityInput.value.trim();
        const autoRenew = autoRenewCheck.checked;

        if (!title || !price || !sellerName || !sellerPhone) {
            alert('Please fill out all required fields marked with *');
            return;
        }

        const commission = Math.round(price * 0.02);
        const securityDeposit = Math.round(price * 0.10);
        const netPayout = Math.max(0, price - commission);

        const defaultCover = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
        const imagesList = uploadedImages.length > 0 ? uploadedImages : [defaultCover];

        const existingListings = getStoredListings();

        if (editingListingId) {
            const index = existingListings.findIndex(l => l.id === editingListingId);
            if (index !== -1) {
                existingListings[index] = {
                    ...existingListings[index],
                    title,
                    category,
                    price,
                    period,
                    description: desc,
                    seller: {
                        name: sellerName,
                        phone: sellerPhone,
                        city: sellerCity
                    },
                    images: imagesList,
                    securityDeposit,
                    commission,
                    netPayout,
                    autoRenew,
                    updatedAt: new Date().toISOString()
                };
            }
            editingListingId = null;
        } else {
            const newListing = {
                id: 'LIST-' + Date.now(),
                title,
                category,
                price,
                period,
                description: desc,
                seller: {
                    name: sellerName,
                    phone: sellerPhone,
                    city: sellerCity
                },
                images: imagesList,
                securityDeposit,
                commission,
                netPayout,
                status: 'Active',
                isBooked: false,
                viewsCount: 0,
                inquiriesCount: 0,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'), // 30 days valid
                autoRenew
            };

            existingListings.unshift(newListing);
        }

        localStorage.setItem('RentFlow_listings', JSON.stringify(existingListings));

        localStorage.setItem('RentFlow_sellerProfile', JSON.stringify({
            name: sellerName,
            phone: sellerPhone,
            city: sellerCity
        }));

        listingForm.reset();
        uploadedImages = [];
        renderImagePreviews();
        updateLivePreviewAndCalculator();
        renderMyListingsDashboard();

        triggerSuccessModal();
    }

    function renderMyListingsDashboard() {
        const grid = document.getElementById('my-listings-grid');
        const countSpan = document.getElementById('total-listings-count');
        if (!grid) return;

        const listings = getStoredListings();
        if (countSpan) countSpan.textContent = listings.length;

        if (listings.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <p style="font-size: 16px;">You haven't listed any items yet.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = listings.map(item => `
            <div class="listing-card-dash" id="card-${item.id}">
                <div class="dash-img-wrap">
                    <img src="${item.images[0]}" alt="${item.title}" />
                    <span class="dash-badge-status ${item.status === 'Active' ? 'dash-badge-active' : 'dash-badge-paused'}">
                        ${item.status} ${item.isBooked ? '• Booked' : ''}
                    </span>
                </div>
                <div class="dash-content">
                    <h4 class="dash-title">${item.title}</h4>
                    <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
                        ₹${item.price.toLocaleString('en-IN')}/${item.period}
                    </div>
                    <div class="dash-meta-stats">
                        <span>${item.viewsCount || 0} views</span>
                        <span>${item.inquiriesCount || 0} chats</span>
                        <span>Expires: ${item.expiresAt || '30 days'}</span>
                    </div>
                    <div class="dash-actions">
                        <button type="button" class="btn-sm" onclick="editListing('${item.id}')">Edit</button>
                        <button type="button" class="btn-sm" onclick="toggleListingStatus('${item.id}')">
                            ${item.status === 'Active' ? 'Pause' : 'Activate'}
                        </button>
                        <button type="button" class="btn-sm btn-sm-danger" onclick="deleteListing('${item.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    window.editListing = function(id) {
        const listings = getStoredListings();
        const item = listings.find(l => l.id === id);
        if (!item) return;

        editingListingId = item.id;
        titleInput.value = item.title;
        categorySelect.value = item.category;
        priceInput.value = item.price;
        pricePeriodSelect.value = item.period;
        descInput.value = item.description;
        sellerNameInput.value = item.seller.name;
        sellerPhoneInput.value = item.seller.phone;
        sellerCityInput.value = item.seller.city;
        autoRenewCheck.checked = item.autoRenew || false;

        uploadedImages = [...item.images];
        renderImagePreviews();
        updateLivePreviewAndCalculator();

        window.scrollTo({ top: 100, behavior: 'smooth' });
    };

    window.toggleListingStatus = function(id) {
        const listings = getStoredListings();
        const item = listings.find(l => l.id === id);
        if (item) {
            item.status = item.status === 'Active' ? 'Paused' : 'Active';
            localStorage.setItem('RentFlow_listings', JSON.stringify(listings));
            renderMyListingsDashboard();
        }
    };

    window.deleteListing = function(id) {
        if (confirm('Are you sure you want to delete this listing?')) {
            let listings = getStoredListings();
            listings = listings.filter(l => l.id !== id);
            localStorage.setItem('RentFlow_listings', JSON.stringify(listings));
            renderMyListingsDashboard();
        }
    };

    function initSellerDetails() {
        const savedSeller = localStorage.getItem('RentFlow_sellerProfile');
        if (savedSeller) {
            try {
                const profile = JSON.parse(savedSeller);
                if (sellerNameInput && profile.name) sellerNameInput.value = profile.name;
                if (sellerPhoneInput && profile.phone) sellerPhoneInput.value = profile.phone;
                if (sellerCityInput && profile.city) sellerCityInput.value = profile.city;
            } catch (e) {
                console.error('Error loading seller profile', e);
            }
        }
    }

    function getStoredListings() {
        const data = localStorage.getItem('RentFlow_listings');
        if (!data) return getInitialDemoListings();
        try {
            return JSON.parse(data);
        } catch (e) {
            return getInitialDemoListings();
        }
    }

    function getInitialDemoListings() {
        return [
            {
                id: 'LIST-101',
                title: 'Sony Alpha A7 III Camera with 24-70mm Lens',
                category: 'Electronics',
                price: 1500,
                period: 'day',
                description: 'Professional full-frame mirrorless camera in pristine condition. Includes 2 batteries and 64GB SD card.',
                seller: { name: 'Rahul Sharma', phone: '+91 98765 43210', city: 'Mumbai' },
                images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'],
                securityDeposit: 150,
                commission: 30,
                netPayout: 1470,
                status: 'Active',
                isBooked: false,
                viewsCount: 42,
                inquiriesCount: 5,
                createdAt: new Date().toISOString(),
                expiresAt: '28 Aug 2026',
                autoRenew: true
            },
            {
                id: 'LIST-102',
                title: 'Mountain Electric Bike (30km Range)',
                category: 'Vehicles',
                price: 500,
                period: 'day',
                description: 'Fast e-bike suitable for daily commuting and weekend rides. Helmet provided.',
                seller: { name: 'Ananya Verma', phone: '+91 91234 56789', city: 'Bengaluru' },
                images: ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=600&q=80'],
                securityDeposit: 50,
                commission: 10,
                netPayout: 490,
                status: 'Active',
                isBooked: true,
                viewsCount: 88,
                inquiriesCount: 12,
                createdAt: new Date().toISOString(),
                expiresAt: '15 Sep 2026',
                autoRenew: false
            }
        ];
    }

    function triggerSuccessModal() {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    window.closeSuccessModal = function() {
        const modal = document.getElementById('success-modal');
        if (modal) modal.classList.remove('active');
    };
});
