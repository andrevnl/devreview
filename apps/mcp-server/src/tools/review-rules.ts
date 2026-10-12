import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSupabase } from '../lib/supabase.js';

export function registerReviewRulesTools(server: McpServer) {
	server.registerTool(
		'get_team_review_rules',
		{
			title: 'Get Team Review Rules',
			description:
				'Retrieves active code review rules for a team, grouped by category. ' +
				"Use when reviewing a PR to know the team's coding standards.",
			inputSchema: {
				team_id: z.string().uuid().describe('UUID of the team (from the teams table)'),
				category: z
					.enum(['style', 'architecture', 'security', 'performance'])
					.optional()
					.describe('Filter by category. Omit to get all categories.'),
			},
		},
		async ({ team_id, category }) => {
			let query = getSupabase()
				.from('review_rules')
				.select('category, rule, severity')
				.eq('team_id', team_id)
				.eq('active', true)
				.order('severity');

			if (category) query = query.eq('category', category);

			const { data, error } = await query;
			if (error) {
				throw new Error(`Failed to fetch review rules: ${error.message}`);
			}

			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({ rules: data, count: data.length }),
					},
				],
			};
		},
	);
}