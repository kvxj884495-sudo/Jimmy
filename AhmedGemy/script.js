$(document).ready(function() {
    let properties = [];
    
    // Type labels mapping
    const typeLabels = {
        'apartment': 'Apartment (شقة)',
        'villa': 'Villa (فيلا)',
        'townhouse': 'Townhouse (توين هاوس)',
        'duplex': 'Duplex (دوبلكس)',
        'twin house': 'Twin House (بيت توأمي)',
        'penthouse': 'Penthouse (بنتهاوس)',
        'ivilla': 'iVilla (أيفيلا)',
        'land': 'Land (أرض)',
        'hotel apartment': 'Hotel Apartment (شقة فندقية)',
        'whole building': 'Whole Building (مبنى كامل)',
        'palace': 'Palace (قصر)',
        'roof': 'Roof (سطح)',
        'chalet': 'Chalet (شاليه)',
        'full floor': 'Full Floor (دور كامل)',
        'bulk sale units': 'Bulk Sale Units (وحدات بيع جملة)',
        'half floor': 'Half Floor (دور نصف)',
        'bungalow': 'Bungalow (بنجلو)',
        'cabin': 'Cabin (كابينة)'
    };
    
    // Load properties from JSON file
    $.getJSON('data.json', function(data) {
        properties = data.properties;
        displayProperties(properties);
    }).fail(function() {
        console.error('Error loading properties data');
        $('#propertiesContainer').html('<div class="no-results">Error loading properties. Please check data.json file.</div>');
    });
    
    // Search functionality
    $('#searchInput').on('input', function() {
        filterProperties();
    });
    
    // Filter functionality
    $('#typeFilter, #locationFilter, #transactionFilter').on('change', function() {
        filterProperties();
    });
    
    function filterProperties() {
        const typeFilter = $('#typeFilter').val();
        const locationFilter = $('#locationFilter').val();
        const transactionFilter = $('#transactionFilter').val();
        const searchQuery = $('#searchInput').val().toLowerCase().trim();
        
        let filtered = properties.filter(function(property) {
            const typeMatch = typeFilter === 'all' || property.type === typeFilter;
            const transactionMatch = transactionFilter === 'all' || property.transaction === transactionFilter;
            
            // Location filter - check if address contains the selected location
            let locationMatch = true;
            if (locationFilter !== 'all' && property.address) {
                const addressLower = property.address.toLowerCase();
                const locationLower = locationFilter.toLowerCase();
                
                // Handle different location matching patterns
                if (locationFilter === 'New Cairo') {
                    locationMatch = addressLower.includes('Smouha') || addressLower.includes('Smouha');
                } else if (locationFilter === 'Sidi Bishr') {
                    locationMatch = addressLower.includes('King Marout') || addressLower.includes('كينج ماريوط') || addressLower.includes('مدينة 6 أكتوبر');
                } else if (locationFilter === 'New Administrative Capital') {
                    locationMatch = addressLower.includes('new administrative capital') || addressLower.includes('administrative capital') || addressLower.includes('العاصمة الإدارية');
                } else if (locationFilter === 'North Coast') {
                    locationMatch = addressLower.includes('north coast') || addressLower.includes('الساحل الشمالي');
                } else {
                    locationMatch = addressLower.includes(locationLower);
                }
            }
            
            let searchMatch = true;
            if (searchQuery) {
                const titleMatch = property.title ? property.title.toLowerCase().includes(searchQuery) : false;
                const addressMatch = property.address ? property.address.toLowerCase().includes(searchQuery) : false;
                const priceMatch = property.price ? property.price.toLowerCase().includes(searchQuery) : false;
                const typeMatchSearch = typeLabels[property.type] ? typeLabels[property.type].toLowerCase().includes(searchQuery) : false;
                searchMatch = titleMatch || addressMatch || priceMatch || typeMatchSearch;
            }
            
            return typeMatch && locationMatch && transactionMatch && searchMatch;
        });
        
        displayProperties(filtered);
    }
    
    function displayProperties(props) {
        if (props.length === 0) {
            $('#propertiesContainer').html('<div class="no-results">No properties found matching your criteria.</div>');
            return;
        }
        
        let html = '';
        props.forEach(function(property, idx) {
            const typeLabel = typeLabels[property.type] || property.type;
            const transactionLabel = property.transaction === 'sale' ? 'Sale (بيع)' : 'Rent (ايجار)';
            const defaultImg = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop';
            const imageUrls = (Array.isArray(property.images) && property.images.length) ? property.images : (property.image ? [property.image] : [defaultImg]);
            const mainImage = imageUrls[0];
            const imagesDataAttr = encodeURIComponent(JSON.stringify(imageUrls));
            
            // Handle properties without rooms/bathrooms (like land)
            const roomsDisplay = property.rooms > 0 ? `
                <div class="detail-item">
                    <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    <span class="detail-label">${property.rooms}</span>
                    <span>Beds</span>
                </div>
            ` : '';
            
            const bathsDisplay = property.bathrooms > 0 ? `
                <div class="detail-item">
                    <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span class="detail-label">${property.bathrooms}</span>
                    <span>Baths</span>
                </div>
            ` : '';
            
            html += `
                <div class="property-card" data-images="${imagesDataAttr}">
                    <div class="property-image-container">
                        <img src="${encodeURI(mainImage)}" alt="${typeLabel}" class="property-image" style="cursor:pointer" onerror="this.src='https://via.placeholder.com/600x400/e0e0e0/999?text=Property+Image'">
                        <div class="thumbnails">
                            ${imageUrls.map((url, idx) => `<img src="${encodeURI(url)}" class="thumb" data-idx="${idx}" onerror="this.src='https://via.placeholder.com/150'">`).join('')}
                        </div>
                        <div class="property-type-badge">${typeLabel}</div>
                        <div class="property-badge">${transactionLabel}</div>
                    </div>
                    <div class="property-body">
                        <div class="property-price">${property.price}</div>
                        <div class="property-title"><a href="property.html?id=${idx}">${property.title || (typeLabel + ' for ' + transactionLabel.toLowerCase())}</a></div>
                        <div class="property-details">
                            ${roomsDisplay}
                            ${bathsDisplay}
                            <div class="detail-item">
                                <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                                </svg>
                                <span class="detail-label">${property.area}</span>
                                <span>sqm</span>
                            </div>
                        </div>
                        <div class="property-address">
                            <svg class="address-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span>${property.address}</span>
                        </div>
                        <div class="property-contact">
                            <script>/* phone display override */</script>
                            <a href="https://wa.me/${'+201222145530'.replace(/[^0-9]/g, '')}" target="_blank" class="property-phone" title="Contact via WhatsApp">
                                <i class="fab fa-whatsapp"></i> +20 1222145530
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        $('#propertiesContainer').html(html);

        // Delegated handlers to open gallery (avoid inline handlers)
        $(document).off('click', '.property-image').on('click', '.property-image', function(e){
            e.stopPropagation();
            const imagesEncoded = this.closest('.property-card') ? this.closest('.property-card').dataset.images : null;
            if (imagesEncoded) openGallery(imagesEncoded, 0);
        });

        $(document).off('click', '.property-card .thumb').on('click', '.property-card .thumb', function(e){
            e.stopPropagation();
            const idx = parseInt($(this).attr('data-idx'), 10) || 0;
            const imagesEncoded = this.closest('.property-card') ? this.closest('.property-card').dataset.images : null;
            if (imagesEncoded) openGallery(imagesEncoded, idx);
        });
    }

    // Lightbox / gallery modal
    function createLightboxIfNeeded() {
        if ($('#lightboxOverlay').length) return;
        const lb = $(`
          <div id="lightboxOverlay" class="lightbox-overlay" style="display:none">
            <div class="lightbox-content">
              <button class="lightbox-close" title="Close">&times;</button>
              <button class="lightbox-prev" title="Previous">&#10094;</button>
              <img class="lightbox-image" src="" alt="Image">
              <button class="lightbox-next" title="Next">&#10095;</button>
              <div class="lightbox-actions">
                <a class="lightbox-open" href="#" target="_blank" rel="noopener noreferrer">Open</a>
                <a class="lightbox-download" href="#" download>Download</a>
              </div>
              <div class="lightbox-thumbs"></div>
            </div>
          </div>
        `);
        $('body').append(lb);
        // events
        $(document).on('click', '#lightboxOverlay .lightbox-close, #lightboxOverlay', function(e) {
            if (e.target.id === 'lightboxOverlay' || $(e.target).hasClass('lightbox-close')) {
                $('#lightboxOverlay').fadeOut(200);
            }
        });
        $(document).on('click', '#lightboxOverlay .lightbox-prev', function(){ lightboxPrev(); });
        $(document).on('click', '#lightboxOverlay .lightbox-next', function(){ lightboxNext(); });
        $(document).on('click', '#lightboxOverlay .lightbox-thumbs img', function(){
            const idx = $(this).index();
            lightboxShowIndex(idx);
        });
        $(document).on('keydown', function(e){ if ($('#lightboxOverlay').is(':visible')) { if (e.key === 'ArrowLeft') lightboxPrev(); else if (e.key === 'ArrowRight') lightboxNext(); else if (e.key === 'Escape') $('#lightboxOverlay').fadeOut(200); }});
    }

    let lbImages = [], lbIndex = 0;
    function openGallery(encodedImages, startIndex) {
        createLightboxIfNeeded();
        try { lbImages = JSON.parse(decodeURIComponent(encodedImages)); } catch (err) { lbImages = []; }
        if (!Array.isArray(lbImages) || lbImages.length === 0) return;
        lbIndex = startIndex || 0;
        lightboxShow();
    }
    function lightboxShow() {
        const overlay = $('#lightboxOverlay');
        const current = encodeURI(lbImages[lbIndex]);
        overlay.find('.lightbox-image').attr('src', current);
        overlay.find('.lightbox-open').attr('href', current);
        overlay.find('.lightbox-download').attr('href', current).attr('download', (current.split('/').pop() || 'image'));
        const thumbs = overlay.find('.lightbox-thumbs').empty();
        lbImages.forEach((u, i)=> {
            const t = $(`<img src="${encodeURI(u)}" class="${i===lbIndex?'active':''}">`);
            thumbs.append(t);
        });
        overlay.fadeIn(200);
    }
    function lightboxShowIndex(i) { lbIndex = i; lightboxShow(); }
    function lightboxNext(){ lbIndex = (lbIndex+1)%lbImages.length; lightboxShow(); }
    function lightboxPrev(){ lbIndex = (lbIndex-1+lbImages.length)%lbImages.length; lightboxShow(); }

    // Open gallery when clicking the property card (exclude links/buttons/thumbs)
    $(document).on('click', '.property-card', function(e){
        // Ignore clicks on interactive elements
        if ($(e.target).closest('a, button, .thumb, .property-phone, .lightbox-actions').length) return;
        const images = this.dataset.images;
        if (images) openGallery(images, 0);
    });

});
