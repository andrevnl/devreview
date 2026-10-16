import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSupabase } from '../lib/supabase.js';
import type { RuleSeverity } from '../schemas.js';
import { READ_ONLY_ANNOTATIONS, UNTRUSTED_TOOL_HINT, untrustedResult } from '../lib/untrusted.js';

// severity é texto no banco: .order() seria alfabético (error, info, warning).
const SEVERITY_WEIGHT: Record<RuleSeverity, number> = { error: 0, warning: 1, info: 2 };

export function registerReviewRulesTools(server: McpServer) {
	server.registerTool(
		'get_team_review_rules',
		{
			title: 'Get Team Review Rules',
			description:
				'Retrieves active code review rules for a team, sorted by severity (error, warning, info) and category. ' +
				"Use when reviewing a PR to know the team's coding standards." +
				UNTRUSTED_TOOL_HINT,
			inputSchema: {
				team_id: z.string().uuid().describe('UUID of the team (from the teams table)'),
				category: z
					.enum(['style', 'architecture', 'security', 'performance'])
					.optional()
					.describe('Filter by category. Omit to get all categories.'),
			},
			annotations: READ_ONLY_ANNOTATIONS,
		},
		async ({ team_id, category }) => {
			let query = getSupabase()
				.from('review_rules')
				.select('category, rule, severity')
				.eq('team_id', team_id)
				.eq('active', true);

			if (category) query = query.eq('category', category);

			const { data, error } = await query;
			if (error) {
				throw new Error(`Failed to fetch review rules: ${error.message}`);
			}

			const rules = [...data].sort(
				(a, b) =>
					SEVERITY_WEIGHT[a.severity as RuleSeverity] - SEVERITY_WEIGHT[b.severity as RuleSeverity] ||
					a.category.localeCompare(b.category),
			);

			return untrustedResult('review_rules', { rules, count: rules.length });
		},
	);
}