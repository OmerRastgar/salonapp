const { createDirectus, rest, login, createCollection, createField } = require('@directus/sdk');

async function setup() {
	const client = createDirectus('http://localhost:8055').with(rest());
	
	try {
		await client.login('admin@saloonmarketplace.com', 'process.env.ADMIN_PASSWORD');
		console.log('Logged in successfully');

		// 1. Create Block Collections
		const blocks = [
			{
				collection: 'block_hero',
				schema: {},
				meta: { icon: 'hero', display: 'Hero Section', group: 'blocks' },
				fields: [
					{ field: 'id', type: 'integer', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
					{ field: 'title', type: 'string', meta: { interface: 'input' } },
					{ field: 'subtitle', type: 'text', meta: { interface: 'textarea' } },
					{ field: 'image', type: 'uuid', meta: { interface: 'file-image' } },
					{ field: 'cta_text', type: 'string', meta: { interface: 'input' } },
					{ field: 'cta_link', type: 'string', meta: { interface: 'input' } }
				]
			},
			{
				collection: 'block_text',
				schema: {},
				meta: { icon: 'text_fields', display: 'Text Section', group: 'blocks' },
				fields: [
					{ field: 'id', type: 'integer', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
					{ field: 'content', type: 'text', meta: { interface: 'wysiwyg' } },
					{ field: 'alignment', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{text: 'Left', value: 'left'}, {text: 'Center', value: 'center'}] } } }
				]
			},
			{
				collection: 'block_features',
				schema: {},
				meta: { icon: 'list', display: 'Features Grid', group: 'blocks' },
				fields: [
					{ field: 'id', type: 'integer', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
					{ field: 'headline', type: 'string', meta: { interface: 'input' } }
					// Features would typically be a nested M2M, let's keep it simple for now or use JSON
				]
			}
		];

		for (const block of blocks) {
			try {
				await client.request(createCollection({
					collection: block.collection,
					schema: block.schema,
					meta: block.meta
				}));
				console.log(`Created collection: ${block.collection}`);
				
				for (const field of block.fields) {
					await client.request(createField(block.collection, field));
				}
				console.log(`Added fields to: ${block.collection}`);
			} catch (e) {
				console.error(`Error creating ${block.collection}:`, e.message);
			}
		}

		// 2. Create Pages Collection
		try {
			await client.request(createCollection({
				collection: 'pages',
				meta: { icon: 'article', display: 'Pages' },
				schema: {}
			}));
			console.log('Created pages collection');
			
			const pageFields = [
				{ field: 'id', type: 'integer', meta: { readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
				{ field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{text: 'Published', value: 'published'}, {text: 'Draft', value: 'draft'}] } }, schema: { default_value: 'draft' } },
				{ field: 'title', type: 'string', meta: { interface: 'input' } },
				{ field: 'slug', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } }
			];

			for (const field of pageFields) {
				await client.request(createField('pages', field));
			}
		} catch (e) {
			console.error('Error creating pages:', e.message);
		}

		// 3. Setup M2A field (The hardest part via SDK sometimes, let's try)
		try {
			await client.request(createField('pages', {
				field: 'blocks',
				type: 'alias',
				meta: {
					interface: 'list-m2a',
					options: {
						allowDuplicates: false,
						enableCreate: true,
						enableSelect: true
					},
					special: ['m2a']
				}
			}));
			console.log('Created M2A blocks field on pages');
		} catch (e) {
			console.error('Error creating M2A field:', e.message);
		}

		console.log('Setup completed!');

	} catch (error) {
		console.error('Setup failed:', error);
	}
}

setup();
