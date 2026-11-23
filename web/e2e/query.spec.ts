import { test, expect } from '@playwright/test';

test('consulta a API real, filtra, mostra vazio e limpa a busca', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Oportunidades comerciais' })).toBeVisible();
  const table = page.getByRole('table');
  await expect(table.getByRole('row')).toHaveCount(4);
  await expect(page.getByRole('region', { name: 'Resumo da consulta' })).toContainText('4.000,00');
  await page.screenshot({ path: '../docs/images/consulta-desktop.png', fullPage: true });

  await page.getByLabel('Situação', { exact: true }).selectOption('aberta');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(table.getByRole('row')).toHaveCount(2);
  await expect(table).toContainText('Clínica Horizonte Demo');
  await expect(table).not.toContainText('Clínica Aurora Demo');
  await expect(page.getByRole('region', { name: 'Resumo da consulta' })).toContainText('1.000,00');
  await page.getByLabel('Empresa ou descrição').fill('não existe xyz');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Nenhuma oportunidade encontrada' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Resumo da consulta' })).toContainText('0,00');
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await expect(table.getByRole('row')).toHaveCount(4);
  await expect(page.getByLabel('Empresa ou descrição')).toHaveValue('');
  await expect(page.getByLabel('Situação', { exact: true })).toHaveValue('');
});

test('layout de celular mantém dados legíveis sem transbordamento da página', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByText('Clínica Horizonte Demo', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Limpar filtros' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  await page.screenshot({ path: '../docs/images/consulta-celular.png', fullPage: true });
});

test('mostra erro da API e recupera ao tentar novamente', async ({ page }) => {
  let fail = true;
  await page.route('**/api/opportunities*', async (route) => {
    if (fail) {
      await route.fulfill({ status: 503, contentType: 'application/json',
        body: JSON.stringify({ message: 'Indisponibilidade simulada para teste.' }) });
    } else { await route.continue(); }
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Indisponibilidade simulada para teste.');
  await expect(page.getByRole('region', { name: 'Resumo da consulta' })).toHaveCount(0);
  fail = false;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(4);
  await expect(page.getByRole('alert')).toHaveCount(0);
});
