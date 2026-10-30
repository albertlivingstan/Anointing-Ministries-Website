import { describe, expect, test } from 'bun:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { existsSync } from 'node:fs';
import { App } from '../src/main';

function render(path: string, state?: object) {
  return renderToStaticMarkup(<MemoryRouter initialEntries={[{ pathname: path, state }]}><App/></MemoryRouter>);
}

describe('Reference-led ministry screens', () => {
  test('home keeps the welcome, scripture, quick access and original ministry sections', () => {
    const html = render('/');
    for (const content of ['Welcome to', 'Worship.', 'Quick Access', 'growing community', 'Ministry', 'Copy', 'Save', 'Share image']) expect(html).toContain(content);
    for (const path of ['/bible', '/worship#songs', '/prayer', '/community#services']) expect(html).toContain(`href="${path}"`);
    expect(html.indexOf('ref-hero')).toBeLessThan(html.indexOf('ref-home-hub'));
    expect(html).not.toContain('Apr 27, 2025');
  });
  test('Bible hub links to the preserved full reader and presentation studio', () => {
    const html = render('/bible');
    for (const content of ['Read the Bible', 'Worship Service', 'Worship Songs', 'English', 'தமிழ்', 'Both']) expect(html).toContain(content);
    expect(html).toContain('href="/bible/read"');
    expect(html).toContain('href="/worship/presentation"');
    expect(html).not.toContain('● LIVE NOW');
  });
  test('full Bible reader retains search, chapter selection and saved filters', () => {
    const html = render('/bible/read');
    for (const label of ['Select book', 'Select chapter', 'Search Bible text']) expect(html).toContain(`aria-label="${label}"`);
    expect(html).toContain('Saved in chapter');
  });
  test('community does not invent a confirmed schedule and prayer draft is unsent', () => {
    const html = render('/community');
    expect(html).toContain('Ask us about our next gathering');
    expect(html).toContain('Continue privately');
    expect(html).toContain('Nothing is sent yet');
    expect(html).not.toContain('UPCOMING');
    expect(html).not.toContain('Pastor Daniel');
  });
  test('community prayer draft reaches the existing validated prayer form', () => {
    const html = render('/prayer', { prayerDraft: 'A sample draft for checking the interface only.' });
    expect(html).toContain('A sample draft for checking the interface only.');
    expect(html).toContain('type="email"');
    expect(html).toContain('minLength="10"');
    expect(html).toContain('Birthday prayer');
  });
  test('profile offers the existing membership flow without displaying passcodes', () => {
    const html = render('/profile');
    expect(html).toContain('Member sign in');
    expect(html).toContain('Notifications &amp; preferences');
    expect(html).not.toContain('Member Passcode:');
    expect(html).toContain('Saved verses');
  });
  test.each(['/','/bible','/worship','/community','/profile'])('bottom navigation marks the active page on %s', path => {
    const html = render(path);
    const nav = html.slice(html.indexOf('class="ref-bottom-nav"'));
    const activeAnchor = [...nav.matchAll(/<a\b[^>]*>/g)].map(match => match[0]).find(anchor => anchor.includes(`href="${path}"`));
    expect(activeAnchor).toContain('aria-current="page"');
    for (const label of ['Home','Bible','Worship','Community','Profile']) expect(nav).toContain(label);
  });
  test('projector audience remains separate from all website navigation', () => {
    const html = render('/worship/display');
    expect(html).not.toContain('ref-bottom-nav');
    expect(html).not.toContain('ref-header');
    expect(html).not.toContain('<button');
  });
  test('all new local image references exist', () => {
    for (const name of ['congregation','church-worship','church','worship-song','anointing-logo']) expect(existsSync(`public/images/${name}.jpg`)).toBe(true);

  });
});
