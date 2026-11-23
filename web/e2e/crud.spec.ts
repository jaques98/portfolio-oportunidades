import { test, expect } from '@playwright/test';

test('cadastra, edita, cancela exclusão e exclui somente o registro temporário', async ({ page }) => {
  const before = await (await page.request.get('/api/opportunities')).json();
  const name = 'Clínica Teste UI ' + Date.now();
  let createdId: number | undefined;
  try {
    await page.goto('/');
    await expect(page.getByRole('table').getByRole('row')).toHaveCount(before.items.length + 1);
    await page.getByRole('button', { name: '+ Nova oportunidade', exact: true }).click();
    const form = page.getByRole('region', { name: 'Nova oportunidade', exact: true });
    await expect(form.getByLabel('Empresa', { exact: true })).toBeFocused();
    await form.getByRole('button', { name: 'Salvar oportunidade' }).click();
    await expect(form.getByText('Use de 2 a 100 caracteres.')).toBeVisible();
    await expect(form.getByLabel('Empresa', { exact: true })).toBeFocused();
    await form.getByLabel('Empresa', { exact: true }).fill(name);
    await form.getByLabel('Descrição').fill('Registro temporário exclusivo do teste de interface.');
    await form.getByLabel('Valor em reais').fill('1234.50');
    const createResponse = page.waitForResponse((r) => r.url().endsWith('/api/opportunities') && r.request().method() === 'POST');
    await form.getByRole('button', { name: 'Salvar oportunidade' }).click();
    const created = await (await createResponse).json();
    createdId = created.id;
    expect(created.amountCents).toBe(123450);
    await expect(form).toHaveCount(0);
    const row = page.getByRole('row').filter({ hasText: name });
    await expect(row).toContainText('1.234,50');

    await page.reload();
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Editar ' + name, exact: true }).click();
    let edit = page.getByRole('region', { name: 'Editar oportunidade', exact: true });
    await expect(edit.getByLabel('Valor em reais')).toHaveValue('1234.50');
    await edit.getByLabel('Empresa', { exact: true }).fill('Alteração que será cancelada');
    await edit.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(row).toContainText(name);
    await row.getByRole('button', { name: 'Editar ' + name, exact: true }).click();
    edit = page.getByRole('region', { name: 'Editar oportunidade', exact: true });
    await expect(edit.getByLabel('Empresa', { exact: true })).toHaveValue(name);
    await edit.getByLabel('Valor em reais').fill('1500.00');
    await edit.getByLabel('Situação da oportunidade').selectOption('ganha');
    await edit.getByRole('button', { name: 'Salvar oportunidade' }).click();
    await expect(edit).toHaveCount(0);
    await expect(row).toContainText('1.500,00');
    await expect(row).toContainText('Ganha');
    const afterEdit = await (await page.request.get('/api/opportunities')).json();
    const record = afterEdit.items.find((item: {id: number}) => item.id === createdId);
    expect(record.createdAt).toBe(created.createdAt);
    expect(record.id).toBe(createdId);

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain(name); await dialog.dismiss();
    });
    await row.getByRole('button', { name: 'Excluir ' + name, exact: true }).click();
    await expect(row).toBeVisible();
    page.once('dialog', async (dialog) => { await dialog.accept(); });
    await row.getByRole('button', { name: 'Excluir ' + name, exact: true }).click();
    await expect(row).toHaveCount(0);
    await expect(page.getByRole('table').getByRole('row')).toHaveCount(before.items.length + 1);
    const after = await (await page.request.get('/api/opportunities')).json();
    expect(after).toEqual(before);
  } finally {
    // Só o id retornado pelo cadastro deste teste pode ser removido na limpeza.
    if (createdId !== undefined) await page.request.delete('/api/opportunities/' + createdId);
  }
});

test('preserva campos em falha, bloqueia envio duplicado e permite tentar novamente', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/opportunities', async (route) => {
    if (route.request().method() === 'POST') {
      calls++;
      await new Promise((resolve) => setTimeout(resolve, 350));
      await route.fulfill({ status: 503, contentType: 'application/json',
        body: JSON.stringify({ message: 'Falha simulada no cadastro.' }) });
    } else { await route.continue(); }
  });
  await page.goto('/');
  await page.getByRole('button', { name: '+ Nova oportunidade', exact: true }).click();
  const form = page.getByRole('region', { name: 'Nova oportunidade', exact: true });
  await form.getByLabel('Empresa', { exact: true }).fill('Empresa Sem Gravação Demo');
  await form.getByLabel('Descrição').fill('Teste com resposta simulada.');
  await form.getByLabel('Valor em reais').fill('10.50');
  await form.getByRole('button', { name: 'Salvar oportunidade' }).click();
  await expect(form.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
  await expect(form.getByRole('button', { name: 'Cancelar', exact: true })).toBeDisabled();
  await expect(form.getByRole('alert')).toContainText('Falha simulada no cadastro.');
  expect(calls).toBe(1);
  await expect(form.getByLabel('Empresa', { exact: true })).toHaveValue('Empresa Sem Gravação Demo');
  await expect(form.getByLabel('Valor em reais')).toHaveValue('10.50');
  await form.getByRole('button', { name: 'Salvar oportunidade' }).click();
  await expect(form.getByRole('alert')).toContainText('Falha simulada no cadastro.');
  expect(calls).toBe(2);
  await form.getByRole('button', { name: 'Cancelar', exact: true }).click();
});

test('formulário e ações ficam acessíveis no celular', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByText('Clínica Horizonte Demo', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '+ Nova oportunidade', exact: true }).click();
  const form = page.getByRole('region', { name: 'Nova oportunidade', exact: true });
  await form.getByLabel('Empresa', { exact: true }).fill('Clínica Exemplo Demo');
  await form.getByLabel('Descrição').fill('Formulário demonstrativo, sem gravação.');
  await form.getByLabel('Valor em reais').fill('1234.50');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.screenshot({ path: '../docs/images/formulario-celular.png', fullPage: true });
  await form.getByRole('button', { name: 'Cancelar', exact: true }).click();
});
