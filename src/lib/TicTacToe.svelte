<script lang="ts">
	// @ts-expect-error Circle is importet via vite
	import cross from '../assets/Cross.png'
	// @ts-expect-error Cross is importet via vite
	import circle from '../assets/Circle.png'

	let grid: string[]
	let player: string
	let won: string = '0'
	let x1: number
	let y1: number
	let x2: number
	let y2: number
	const winMoves: number[][] = [
		[0, 1, 2, 5, 16, 95, 16],
		[3, 4, 5, 5, 50, 95, 50],
		[6, 7, 8, 5, 84, 95, 84],
		[0, 3, 6, 16, 5, 16, 95],
		[1, 4, 7, 50, 5, 50, 95],
		[2, 5, 8, 84, 5, 84, 95],
		[0, 4, 8, 5, 5, 95, 95],
		[2, 4, 6, 95, 5, 5, 95],
	]

	function checkwin() {
		for (let i = 0; i < winMoves.length; i++) {
			const a = grid[winMoves[i][0]]
			const b = grid[winMoves[i][1]]
			const c = grid[winMoves[i][2]]

			if (a === 'X' && b === 'X' && c === 'X') won = 'X'
			else if (a === 'O' && b === 'O' && c === 'O') won = 'O'

			if (won !== '0' && won !== '-') {
				x1 = winMoves[i][3]
				y1 = winMoves[i][4]
				x2 = winMoves[i][5]
				y2 = winMoves[i][6]
				return
			}
		}

		if (
			grid[0] !== undefined &&
			grid[1] !== undefined &&
			grid[2] !== undefined &&
			grid[3] !== undefined &&
			grid[4] !== undefined &&
			grid[5] !== undefined &&
			grid[6] !== undefined &&
			grid[7] !== undefined &&
			grid[8] !== undefined
		) {
			won = '-'
		}
	}

	function registerMove(cell: number) {
		if (won === '0') {
			if (grid[cell] !== undefined) return
			if (player === 'X') {
				grid[cell] = 'X'
				player = 'O'
			} else {
				grid[cell] = 'O'
				player = 'X'
			}
			checkwin()
		}
	}

	function reset() {
		const tmp = Math.floor(Math.random() * 2) + 1
		if (tmp === 1) player = 'X'
		else player = 'O'
		won = '0'
		grid = []
		x1 = NaN
		x2 = NaN
		y1 = NaN
		y2 = NaN
	}

	reset()
</script>

<main>
	<div class="tictactoeholder">
		<h1 style="width:100%; margin-top: 20px">TicTacToe</h1>
		{#if player === 'X' && won === '0'}
			<p style="width: 100%; font-size:20px">
				Player <span style="color: red;">X</span> is
			</p>
		{:else if player === 'O' && won === '0'}
			<p style="width: 100%; font-size:20px">
				Player <span style="color: blue;">O</span> is
			</p>
		{:else if won === 'X'}
			<p style="color: red; width: 100%; font-size:20px">X won!</p>
		{:else if won === 'O'}
			<p style="color: blue; width: 100%; font-size:20px">O won!</p>
		{:else if won === '-'}
			<p style="width: 100%; font-size:20px">Unentschieden!</p>
		{/if}
		<div class="tictactoefield">
			<div class="grid">
				<button
					on:click={() => registerMove(0)}
					class="cell"
					style="border-top-left-radius: 20px;"
				>
					{#if grid[0] === 'X'}
						<img src={cross} alt="Cross" style="width: 80%; margin: 10%;" />
					{:else if grid[0] === 'O'}
						<img src={circle} alt="Circle" style="width: 80%; margin: 10%;" />
					{/if}
				</button>
				<div class="verticalBarrier" />
				<button on:click={() => registerMove(1)} class="cell">
					{#if grid[1] === 'X'}
						<img src={cross} alt="Cross" style="width: 80%; margin: 10%;" />
					{:else if grid[1] === 'O'}
						<img src={circle} alt="Circle" style="width: 80%; margin: 10%;" />
					{/if}
				</button>
				<div class="verticalBarrier" />
				<button
					on:click={() => registerMove(2)}
					class="cell"
					style="border-top-right-radius: 20px;"
				>
					{#if grid[2] === 'X'}
						<img src={cross} alt="Cross" style="width: 80%; margin: 10%;" />
					{:else if grid[2] === 'O'}
						<img src={circle} alt="Circle" style="width: 80%; margin: 10%;" />
					{/if}
				</button>

				<div class="horizontalBarrier" />

				<button on:click={() => registerMove(3)} class="cell">
					{#if grid[3] === 'X'}
						<img src={cross} alt="Cross" style="width: 80%; margin: 10%;" />
					{:else if grid[3] === 'O'}
						<img src={circle} alt="Circle" style="width: 80%; margin: 10%;" />
					{/if}
				</button>
				<div class="verticalBarrier" />
				<button on:click={() => registerMove(4)} class="cell">
					{#if grid[4] === 'X'}
						<img src={cross} alt="Cross" style="width: 80%; margin: 10%;" />
					{:else if grid[4] === 'O'}
						<img src={circle} alt="Circle" style="width: 80%; margin: 10%;" />
					{/if}
				</button>
				<div class="verticalBarrier" />
				<button on:click={() => registerMove(5)} class="cell">
					{#if grid[5] === 'X'}
						<img src={cross} alt="Cross" style="width: 80%; margin: 10%;" />
					{:else if grid[5] === 'O'}
						<img src={circle} alt="Circle" style="width: 80%; margin: 10%;" />
					{/if}
				</button>

				<div class="horizontalBarrier" />

				<button
					on:click={() => registerMove(6)}
					class="cell"
					style="border-bottom-left-radius: 20px;"
				>
					{#if grid[6] === 'X'}
						<img src={cross} alt="Cross" style="width: 80%; margin: 10%;" />
					{:else if grid[6] === 'O'}
						<img src={circle} alt="Circle" style="width: 80%; margin: 10%;" />
					{/if}
				</button>
				<div class="verticalBarrier" />
				<button on:click={() => registerMove(7)} class="cell">
					{#if grid[7] === 'X'}
						<img src={cross} alt="Cross" style="width: 80%; margin: 10%;" />
					{:else if grid[7] === 'O'}
						<img src={circle} alt="Circle" style="width: 80%; margin: 10%;" />
					{/if}
				</button>
				<div class="verticalBarrier" />
				<button
					on:click={() => registerMove(8)}
					class="cell"
					style="border-bottom-right-radius: 20px;"
				>
					{#if grid[8] === 'X'}
						<img src={cross} alt="Cross" style="width: 80%; margin: 10%;" />
					{:else if grid[8] === 'O'}
						<img src={circle} alt="Circle" style="width: 80%; margin: 10%;" />
					{/if}
				</button>
			</div>
			{#if won !== '0'}
				<svg
					style="position: absolute; left: 0; right: 0; top: 0; bottom: 0;"
					width="100%"
					height="100%"
				>
					<line
						x1="{x1}%"
						y1="{y1}%"
						x2="{x2}%"
						y2="{y2}%"
						stroke="black"
						stroke-width="25"
						style="opacity: 0.2"
						stroke-linecap="round"
					/>
				</svg>
			{/if}
		</div>
		<div style="width: 100%;">
			<button class="button" on:click={() => reset()}> Start New Game </button>
		</div>
	</div>
</main>

<style>
	.tictactoefield {
		display: block;
		justify-content: center;
		margin: 50px;
		margin-top: 10px;
		position: relative;
	}

	.grid {
		max-width: 60vh;
		display: grid;
		grid-template-columns: 25fr 1fr 25fr 1fr 25fr;
	}

	.cell {
		display: flex;
		aspect-ratio: 1 / 1;
		background-color: rgb(164, 162, 162);
	}

	.verticalBarrier {
		background-color: grey;
		width: 10px;
	}

	.horizontalBarrier {
		background-color: grey;
		height: 10px;
		grid-column: 5 span;
	}

	.tictactoeholder {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		text-align: center;
	}

	.button {
		width: 200px;
		height: 30px;
		border-radius: 10px;
		background-color: yellowgreen;
	}

	.button:active {
		background-color: rgb(113, 148, 44);
	}
</style>
