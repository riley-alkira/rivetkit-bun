import { actor, event, setup } from "rivetkit";

export interface DashboardActorState {
	lastUpdated: Date;
	nextUpdate: Date | null;
	scheduleToken: string | null;
	data: Recipe;
}

export interface Recipe {
	id: number;
	name: string;
	ingredients: string[];
	instructions: string[];
	prepTimeMinutes: number;
	cookTimeMinutes: number;
	servings: number;
	difficulty: "Easy" | "Medium" | "Hard";
	cuisine: string;
	caloriesPerServing: number;
	tags: string[];
	userId: number;
	image: string;
	rating: number;
	reviewCount: number;
	mealType: string[];
}

async function fetchData() {
	const randomNumber = Math.floor(Math.random() * 30) + 1;
	const res = await fetch(`https://dummyjson.com/recipes/${randomNumber.toString()}`);
	const data = await res.json()
	return data as Recipe
}

interface ScheduleContext {
	state: DashboardActorState;
	schedule: {
		at: (time: number, action: string, token?: string) => void;
	};
}

function scheduleNext(c: ScheduleContext, delayMs: number, action: string): void {
	const runAt = Date.now() + delayMs;
	const token = crypto.randomUUID();

	c.state.nextUpdate = new Date(runAt);
	c.state.scheduleToken = token;
	c.schedule.at(runAt, action, token);
}

const dashboardActor = actor({
	options: {
		noSleep: true
	},
	createState: async () => {
		const data = await fetchData()

		return {
			lastUpdated: new Date(),
			nextUpdate: null,
			scheduleToken: null,
			data: data
		} as DashboardActorState
	},

	events: {
		updatedData: event<Recipe>()
	},

	actions: {
		hydrateState: (c) => {
			if (!c.state.nextUpdate || c.state.nextUpdate.getTime() < Date.now() + 1000) {
				scheduleNext(c, 0, "updateData")
			} else {
				c.conn.send("updatedData", c.state.data)
			}
		},

		updateData: async (c, scheduleToken: string) => {
			if (c.aborted) return;

			if (c.conns.size > 0) {
				if (scheduleToken !== c.state.scheduleToken) return;

				const data = await fetchData()
				c.state.data = data
				c.state.lastUpdated = new Date()
				c.broadcast('updatedData', data)

				scheduleNext(c, 30000, "updateData")
			} else {
				c.destroy();
			}
		}
	}
});

export const registry = setup({
	use: { dashboardActor }
});