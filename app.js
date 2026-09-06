      (function () {
        const input = document.getElementById('q');
        const clearBtn = document.getElementById('clear');
        const status = document.getElementById('status');
        const totalEl = document.getElementById('total');
        const sections = document.querySelectorAll('#list .section');
        const grid = () => Array.from(document.querySelectorAll('#list .grid a'));

        // subtle gradient pop bling — staggered pop-in + recurring random jitter per tile
        (function bling() {
          const tiles = document.querySelectorAll('#list .grid a');
          tiles.forEach((link, i) => {
            link.style.setProperty('--pop-in', (i * 0.018 + Math.random() * 0.05).toFixed(3) + 's');
            const btn = link.querySelector('.btn');
            if (btn) {
              btn.style.setProperty('--jit-delay', (Math.random() * 6).toFixed(2) + 's');
              btn.style.setProperty('--jit-dur', (5 + Math.random() * 5).toFixed(2) + 's');
            }
          });
        })();

        // semver bubble text is embedded in the #ver element (updated per release)
        (function versionBubble() {
          const el = document.getElementById('ver');
          if (el) el.classList.add('ready');
        })();

        // count badges + grand total
        function recount() {
          let total = 0;
          sections.forEach(s => {
            const n = s.querySelectorAll('.grid a').length;
            s.querySelector('.count').textContent = n;
            total += n;
          });
          totalEl.textContent = total;
        }
        recount();

        // visible dial tiles (in DOM order)
        function visibleTiles() {
          return grid().filter(a => a.offsetParent !== null && !a.classList.contains('hidden'));
        }
        function visibleSections() {
          return Array.from(sections).filter(s => s.offsetParent !== null && !s.classList.contains('hidden'));
        }
        function sectionTiles(s) {
          return Array.from(s.querySelectorAll('.grid a')).filter(a => a.offsetParent !== null && !a.classList.contains('hidden'));
        }
        // number of grid columns in a section (measured from its first row)
        function colsOf(tiles) {
          if (!tiles.length) return 1;
          const firstTop = tiles[0].offsetTop;
          let cols = 0;
          for (const t of tiles) { if (t.offsetTop === firstTop) cols++; else break; }
          return Math.max(1, cols);
        }
        // jump vertically to the next/previous letter category, keeping the
        // same horizontal (column) position within the target section's first row.
        function jumpCategory(dir) {
          if (!active) { const t = visibleTiles()[0]; if (t) setActive(t); return; }
          const curSec = active.closest('.section');
          const visSecs = visibleSections();
          const curIdx = visSecs.indexOf(curSec);
          let target = null;
          for (let i = curIdx + dir; i >= 0 && i < visSecs.length; i += dir) {
            if (sectionTiles(visSecs[i]).length) { target = visSecs[i]; break; }
          }
          if (!target) return;
          const curTiles = sectionTiles(curSec);
          const curCols = colsOf(curTiles);
          const col = curTiles.indexOf(active) % curCols;
          const targetTiles = sectionTiles(target);
          setActive(targetTiles[Math.min(col, targetTiles.length - 1)]);
        }

        // active (keyboard-focused) tile
        let active = null;
        function setActive(a) {
          if (active && active.querySelector) active.querySelector('.btn')?.classList.remove('is-active');
          active = a || null;
          if (active) {
            active.querySelector('.btn').classList.add('is-active');
            active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            setStatus('<b>' + active.textContent + '</b> · Enter to open');
          }
        }

        function setStatus(html) { status.innerHTML = html; }

        function filter() {
          const q = input.value.trim().toLowerCase();
          let total = 0;
          sections.forEach(s => {
            let shown = 0;
            s.querySelectorAll('.grid a').forEach(a => {
              const text = a.textContent.toLowerCase();
              const match = !q || text.includes(q);
              a.classList.toggle('hidden', !match);
              if (match) shown++;
            });
            total += shown;
            const old = s.querySelector('.empty');
            if (old) old.remove();
            s.classList.toggle('hidden', shown === 0);
            s.querySelector('.count').textContent = shown;
          });

          let notice = document.getElementById('noresults');
          if (total === 0) {
            if (!notice) {
              notice = document.createElement('div');
              notice.id = 'noresults';
              notice.className = 'empty';
              notice.style.textAlign = 'center';
              document.getElementById('list').appendChild(notice);
            }
            notice.textContent = 'no projects match "' + input.value + '"';
            setStatus('<span class="dim">no matches</span>');
            if (active) active.querySelector('.btn')?.classList.remove('is-active');
            active = null;
          } else if (notice) {
            notice.remove();
            if (!active) setStatus('<span class="dim">ready ·</span> <b>' + total + '</b> projects');
            else setStatus('<b>' + active.textContent + '</b> · Enter to open');
          }

          clearBtn.classList.toggle('show', q.length > 0);
        }

        input.addEventListener('input', filter);

        clearBtn.addEventListener('click', function () {
          input.value = '';
          filter();
          input.focus();
        });

        // keyboard: / focuses, Esc clears, arrows dial, Enter opens
        document.addEventListener('keydown', function (e) {
          if (e.key === '/' && document.activeElement !== input) {
            e.preventDefault();
            input.focus();
            return;
          }
          if (e.key === 'Escape') {
            input.value = '';
            filter();
            input.blur();
            if (active) { active.querySelector('.btn')?.classList.remove('is-active'); }
            active = null;
            return;
          }
          if (e.key === 'Backspace' && document.activeElement !== input && document.activeElement.tagName !== 'INPUT') {
            input.focus();
            return;
          }

          const tiles = visibleTiles();
          if (tiles.length === 0) return;
          let idx = active ? tiles.indexOf(active) : -1;

          switch (e.key) {
            case 'ArrowRight':
              e.preventDefault();
              idx = (idx + 1 + tiles.length) % tiles.length;
              setActive(tiles[idx]);
              break;
            case 'ArrowLeft':
              e.preventDefault();
              idx = (idx - 1 + tiles.length) % tiles.length;
              setActive(tiles[idx]);
              break;
            case 'ArrowDown':
              e.preventDefault();
              jumpCategory(1);
              break;
            case 'ArrowUp':
              e.preventDefault();
              jumpCategory(-1);
              break;
            case 'Enter':
              if (active) {
                e.preventDefault();
                window.location.href = active.href;
              }
              break;
            case 'Home':
              if (document.activeElement !== input) { e.preventDefault(); setActive(tiles[0]); }
              break;
            case 'End':
              if (document.activeElement !== input) { e.preventDefault(); setActive(tiles[tiles.length-1]); }
              break;
          }
        });

        // mouse spotlight — white glow tracks the cursor
        (function spotlight() {
          window.addEventListener('pointermove', (e) => {
            document.body.style.setProperty('--mx', (e.clientX / window.innerWidth * 100).toFixed(2) + '%');
            document.body.style.setProperty('--my', (e.clientY / window.innerHeight * 100).toFixed(2) + '%');
          }, { passive: true });
        })();

        // 3D tilt — buttons lean toward the cursor on hover
        (function tilt() {
          document.querySelectorAll('#list .grid a, footer .row a').forEach(link => {
            const btn = link.querySelector('.btn');
            if (!btn) return;
            link.addEventListener('pointermove', (e) => {
              const r = link.getBoundingClientRect();
              const px = (e.clientX - r.left) / r.width - 0.5;
              const py = (e.clientY - r.top) / r.height - 0.5;
              btn.style.setProperty('--rx', (py * -10).toFixed(2) + 'deg');
              btn.style.setProperty('--ry', (px * 12).toFixed(2) + 'deg');
            });
            link.addEventListener('pointerleave', () => {
              btn.style.setProperty('--rx', '0deg');
              btn.style.setProperty('--ry', '0deg');
            });
          });
        })();

        // click ripple — material-style feedback on every button
        (function ripples() {
          document.addEventListener('pointerdown', (e) => {
            const btn = e.target.closest('.btn');
            if (!btn) return;
            const r = btn.getBoundingClientRect();
            const size = Math.max(r.width, r.height);
            const s = document.createElement('span');
            s.className = 'ripple';
            s.style.width = s.style.height = size + 'px';
            s.style.left = (e.clientX - r.left) + 'px';
            s.style.top = (e.clientY - r.top) + 'px';
            btn.appendChild(s);
            setTimeout(() => s.remove(), 600);
          });
        })();

        // scroll progress bar + back-to-top button
        (function scrollFX() {
          const bar = document.createElement('div');
          bar.className = 'progress';
          document.body.appendChild(bar);
          const top = document.createElement('button');
          top.className = 'totop';
          top.type = 'button';
          top.setAttribute('aria-label', 'back to top');
          top.textContent = '↑';
          top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
          document.body.appendChild(top);
          const onScroll = () => {
            const h = document.documentElement;
            const max = h.scrollHeight - h.clientHeight;
            bar.style.setProperty('--p', (max > 0 ? (h.scrollTop / max) * 100 : 0).toFixed(2) + '%');
            top.classList.toggle('show', h.scrollTop > 400);
          };
          window.addEventListener('scroll', onScroll, { passive: true });
          onScroll();
        })();

        // animated count-up for the grand total on load
        (function countUp() {
          const target = parseInt(totalEl.textContent, 10) || 0;
          if (!target || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
          let n = 0;
          totalEl.textContent = '0';
          const step = Math.max(1, Math.ceil(target / 28));
          const tick = () => {
            n = Math.min(target, n + step);
            totalEl.textContent = n;
            if (n < target) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        })();
      })();
