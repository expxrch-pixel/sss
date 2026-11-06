/**
 * OTF — onythefamily | Members Roster Logic
 * Dynamic rendering, search filter, rank category tabs, and interactive profile modal.
 */

(() => {
  'use strict';

  // DOM Elements
  const ownerList = document.getElementById('ownerList');
  const coreList = document.getElementById('coreList');
  const supportList = document.getElementById('supportList');
  const memberList = document.getElementById('memberList');

  const ownerBlock = document.getElementById('ownerBlock');
  const coreBlock = document.getElementById('coreBlock');
  const supportBlock = document.getElementById('supportBlock');
  const memberBlock = document.getElementById('memberBlock');

  const searchInput = document.getElementById('memberSearch');
  const filterBtns = document.querySelectorAll('.filter');
  const emptyState = document.getElementById('emptyState');

  // Summary Counters
  const totalCountEl = document.getElementById('totalCount');
  const ownerCountEl = document.getElementById('ownerCount');
  const coreCountEl = document.getElementById('coreCount');
  const supportCountEl = document.getElementById('supportCount');
  const memberCountEl = document.getElementById('memberCount');

// Badge Counters
const badgeOwner = document.querySelector('#badgeOwner');
const badgeCore = document.querySelector('#badgeCore');
const badgeSupport = document.querySelector('#badgeSupport');
const badgeMember = document.querySelector('#badgeMember');


  // Modal Elements
  const profileOverlay = document.getElementById('profileOverlay');
  const profileModal = document.getElementById('profileModal');
  const profileClose = document.getElementById('profileClose');
  const modalCover = document.getElementById('modalCover');
  const modalAvatar = document.getElementById('modalAvatar');
  const modalRoleBadge = document.getElementById('modalRoleBadge');
  const modalStatusBadge = document.getElementById('modalStatusBadge');
  const modalStatusText = document.getElementById('modalStatusText');
  const modalName = document.getElementById('modalName');
  const modalCustomTitle = document.getElementById('modalCustomTitle');
  const modalHouse = document.getElementById('modalHouse');
  const modalSocialLinks = document.getElementById('modalSocialLinks');

  let currentMembers = [];
  let activeFilter = 'all';
  let searchTerm = '';

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatCount(num) {
    return num < 10 ? `0${num}` : `${num}`;
  }

  function updateCounters(allList) {
    const total = allList.length;
    const owners = allList.filter(m => m.role === 'owner').length;
    const cores = allList.filter(m => m.role === 'core').length;
    const supports = allList.filter(m => m.role === 'bigsupport').length;
    const members = allList.filter(m => m.role === 'member').length;

    totalCountEl.textContent = formatCount(total);
    ownerCountEl.textContent = formatCount(owners);
    coreCountEl.textContent = formatCount(cores);
    supportCountEl.textContent = formatCount(supports);
    memberCountEl.textContent = formatCount(members);

    if (badgeOwner) badgeOwner.textContent = `${owners} สมาชิก`;
    if (badgeCore) badgeCore.textContent = `${cores} สมาชิก`;
    if (badgeSupport) badgeSupport.textContent = `${supports} สมาชิก`;
    if (badgeMember) badgeMember.textContent = `${members} สมาชิก`;
  }

  function openProfile(member) {
    modalCover.src = (member.cover && !member.cover.includes('photo-1618005182384')) ? member.cover : "otf-banner-wave.jpg";
    modalAvatar.src = member.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80";

    const roleName = (member.role || 'MEMBER').toLowerCase() === 'core'
      ? 'Leader'
      : (member.role || 'MEMBER').toUpperCase();
    modalRoleBadge.textContent = roleName;

    const status = (member.status || 'online').toLowerCase();
    modalStatusBadge.setAttribute('data-status', status);
    modalStatusText.textContent = status.toUpperCase();

    modalName.textContent = member.name;
    modalCustomTitle.textContent = member.customRoleTitle || member.alias || 'MEMBER';
    if (modalHouse) modalHouse.textContent = member.house || 'OTF — onythefamily';

    // Populate Social Links: ONLY Facebook with official logo
    modalSocialLinks.innerHTML = '';
    const fbUrl = (member.facebook && member.facebook !== '#') ? member.facebook : 'https://facebook.com';
    const btn = document.createElement('a');
    btn.className = 'modal-facebook-btn';
    btn.href = fbUrl;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      <span>Facebook</span>
    `;
    modalSocialLinks.appendChild(btn);

    profileOverlay.classList.add('show');
    profileModal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeProfile() {
    profileOverlay.classList.remove('show');
    profileModal.classList.remove('show');
    document.body.style.overflow = '';
  }

  profileClose.addEventListener('click', closeProfile);
  profileOverlay.addEventListener('click', closeProfile);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProfile();
  });

  // Render Functions
  function createFeaturedOwnerCard(m) {
    const card = document.createElement('div');
    card.className = 'featured-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
      <div class="featured-portrait">
        <div class="card-status-indicator" data-status="${escapeHtml(m.status || 'online')}">
          <span class="status-dot"></span>
          <span>${escapeHtml((m.status || 'online').toUpperCase())}</span>
        </div>
        <img src="${escapeHtml(m.avatar)}" alt="${escapeHtml(m.name)}" loading="lazy">
      </div>
      <div class="featured-content">
        <div class="card-role-pill">${escapeHtml(m.customRoleTitle || 'FOUNDER & OWNER')}</div>
        <h2>${escapeHtml(m.name)}</h2>
        ${m.alias ? `<div class="card-alias">${escapeHtml(m.alias)}</div>` : ''}
        ${m.quote ? `<div class="card-snippet">"${escapeHtml(m.quote)}"</div>` : ''}
        <div class="card-meta-row">
          ${m.joinDate ? `<span>📅 เข้าร่วมเมื่อ ${escapeHtml(m.joinDate)}</span>` : ''}
        </div>
        <div class="card-open-link">
          ดูข้อมูลสมาชิกเต็ม <span>→</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => openProfile(m));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openProfile(m); });
    return card;
  }

  function createCoreCard(m, isSupport = false) {
    const sourceRoleLabel = m.customRoleTitle || (isSupport ? 'BIGSUPPORT' : 'Leader');
    const roleLabel = String(sourceRoleLabel).trim().toLowerCase() === 'core' ? 'Leader' : sourceRoleLabel;
    const card = document.createElement('div');
    card.className = 'core-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
      <div class="core-portrait">
        <div class="card-status-indicator" data-status="${escapeHtml(m.status || 'online')}">
          <span class="status-dot"></span>
          <span>${escapeHtml((m.status || 'online').toUpperCase())}</span>
        </div>
        <img src="${escapeHtml(m.avatar)}" alt="${escapeHtml(m.name)}" loading="lazy">
      </div>
      <div class="core-content">
        <div class="card-role-pill">${escapeHtml(roleLabel)}</div>
        <h3>${escapeHtml(m.name)}</h3>
        <p>${escapeHtml(m.quote || m.bio || 'สมาชิกคนสำคัญของครอบครัว OTF')}</p>
        <div class="card-meta-row">
          ${m.alias ? `<span># ${escapeHtml(m.alias)}</span>` : ''}
          <span>🏛 OTF</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => openProfile(m));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openProfile(m); });
    return card;
  }

  function createMemberCard(m) {
    const card = document.createElement('div');
    card.className = 'member-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
      <div class="member-avatar-wrap">
        <img src="${escapeHtml(m.avatar)}" alt="${escapeHtml(m.name)}" loading="lazy">
      </div>
      <div class="member-info">
        <h4>${escapeHtml(m.name)}</h4>
        <span>${escapeHtml(m.customRoleTitle || m.alias || 'MEMBER')}</span>
      </div>
      <div class="member-status-mini" data-status="${escapeHtml(m.status || 'online')}" title="${escapeHtml(m.status || 'online')}"></div>
    `;
    card.addEventListener('click', () => openProfile(m));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openProfile(m); });
    return card;
  }

  function renderRoster() {
    const list = window.OTF_DATA ? window.OTF_DATA.getMembers() : [];
    updateCounters(list);

    // Apply Filter & Search
    const term = searchTerm.trim().toLowerCase();
    const filtered = list.filter(m => {
      const matchRank = (activeFilter === 'all') || (m.role === activeFilter);
      if (!matchRank) return false;

      if (!term) return true;
      const haystack = `${m.name} ${m.alias || ''} ${m.customRoleTitle || ''} ${m.quote || ''} ${m.bio || ''}`.toLowerCase();
      return haystack.includes(term);
    });

    // Clear containers
    ownerList.innerHTML = '';
    coreList.innerHTML = '';
    supportList.innerHTML = '';
    memberList.innerHTML = '';

    const owners = filtered.filter(m => m.role === 'owner');
    const cores = filtered.filter(m => m.role === 'core');
    const supports = filtered.filter(m => m.role === 'bigsupport');
    const members = filtered.filter(m => m.role === 'member');

    // Populate OWNER
    if (owners.length > 0) {
      ownerBlock.classList.remove('hide-section');
      owners.forEach(m => ownerList.appendChild(createFeaturedOwnerCard(m)));
    } else {
      ownerBlock.classList.add('hide-section');
    }

    // Populate CORE / LEADER
    if (cores.length > 0) {
      coreBlock.classList.remove('hide-section');
      cores.forEach(m => coreList.appendChild(createCoreCard(m, false)));
    } else {
      coreBlock.classList.add('hide-section');
    }

    // Populate BIGSUPPORT
    if (supports.length > 0) {
      supportBlock.classList.remove('hide-section');
      supports.forEach(m => supportList.appendChild(createCoreCard(m, true)));
    } else {
      supportBlock.classList.add('hide-section');
    }

    // Populate MEMBERS
    if (members.length > 0) {
      memberBlock.classList.remove('hide-section');
      members.forEach(m => memberList.appendChild(createMemberCard(m)));
    } else {
      memberBlock.classList.add('hide-section');
    }

    // Show empty state if nothing matches
    if (filtered.length === 0) {
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
    }
  }

  // Search Event
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderRoster();
  });

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderRoster();
    });
  });

  // Listen for local member updates
  window.addEventListener('otf:members_updated', () => {
    renderRoster();
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'otf_members_v2' || e.key === 'otf_members_v1') {
      renderRoster();
    }
  });

  // Initial Render
  document.addEventListener('DOMContentLoaded', () => {
    renderRoster();
  });
})();







