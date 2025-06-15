<script lang="ts">
	// @ts-expect-error Circle is importet via vite
	import cross from '../assets/Cross.png'
	// @ts-expect-error Cross is importet via vite
	import circle from '../assets/Circle.png'

	let grid: string[]

	let player: string
	let bot = 'NoN'
	let opp: string //opponent
	let firstPlayer: string

	let botMoves: number

	let won: string = '0'
	let x1: number
	let y1: number
	let x2: number
	let y2: number

	let settings = false
	let firstPlayerSetting = 'random'
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

	function botBasicMove() {
		for (let i = 0; i < winMoves.length; i++) {
			const a = grid[winMoves[i][0]]
			const b = grid[winMoves[i][1]]
			const c = grid[winMoves[i][2]]

			if (a === bot && b === bot && c === undefined) return winMoves[i][2]
			else if (a === bot && b === undefined && c === bot) return winMoves[i][1]
			else if (a === undefined && b === bot && c === bot) return winMoves[i][0]
		}

		for (let i = 0; i < winMoves.length; i++) {
			const a = grid[winMoves[i][0]]
			const b = grid[winMoves[i][1]]
			const c = grid[winMoves[i][2]]

			if (a === opp && b === opp && c === undefined) return winMoves[i][2]
			else if (a === opp && b === undefined && c === opp) return winMoves[i][1]
			else if (a === undefined && b === opp && c === opp) return winMoves[i][0]
		}
	}

	function botStall() {
		if (grid[1] === undefined) return 1
		if (grid[3] === undefined) return 3
		if (grid[5] === undefined) return 5
		if (grid[7] === undefined) return 7

		let n = 0
		while (grid[n] !== undefined && n < 9) n++
		return n
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
			if (bot === player) {
				setTimeout(() => {
					botMove()
				}, 300)
			}
		}
	}

	function botMove() {
		let move = botBasicMove()

		if (firstPlayer === opp) {
			if (botMoves === 0 && grid[4] === undefined) move = 4
			else if (botMoves === 0 && grid[4] === opp) move = 0
			// if (botMoves === 1 && grid[4] === 'X' && grid[7] === undefined) move = 7
			// if (botMoves === 1 && grid[4] === 'X' && grid[7] === 'O' && grid[1] === undefined) move = 1
			// if (botMoves === 1 && grid[4] === 'X' && grid[7] === 'O' && grid[3] === undefined) move = 3
		}

		if (firstPlayer === bot) {
			if (botMoves === 0) move = 0
			else if (grid[4] === opp && botMoves === 1) move = 8
			else if (
				(grid[1] === opp || grid[2] === opp || grid[5] === opp) &&
				botMoves === 1
			) {
				move = 6
			} else if (
				(grid[3] === opp || grid[6] === opp || grid[7] === opp) &&
				botMoves === 1
			) {
				move = 2
			} else if (grid[8] === opp && botMoves === 1) move = 7
			else if (grid[8] === opp && botMoves === 2) move = 2
			else if (
				(grid[3] === opp || grid[6] === opp) &&
				botMoves === 2 &&
				grid[8] === undefined
			) {
				move = 8
			} else if (botMoves === 2) move === 5
		}

		if (move !== undefined) registerMove(move)
		else registerMove(botStall())
		console.log('Bot chose: ', move)
		botMoves++
	}

	function reset() {
		if (firstPlayerSetting === 'random') {
			const tmp = Math.floor(Math.random() * 2) + 1
			if (tmp === 1) player = 'X'
			else player = 'O'
		} else {
			player = firstPlayerSetting
		}

		if (bot === 'X') opp = 'O'
		else opp = 'X'

		firstPlayer = player
		botMoves = 0
		won = '0'
		grid = []
		x1 = -10
		x2 = -10
		y1 = 0
		y2 = 0
		settings = false
		setTimeout(() => {
			if (firstPlayer === bot) botMove()
		}, 500)
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
						style="opacity: 0.4"
						stroke-linecap="round"
					/>
				</svg>
			{/if}
			{#if settings}
				<div
					style="position: absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: lightgray; border-radius: 10px"
				>
					<button
						style="position: absolute; right: 0; top: 0; background-color: red; border-radius: 3px; width: 20px"
						on:click={() => (settings = false)}>X</button
					>
					<h3 style="margin-top: 10px;">Settings</h3>
					<p>Bot is currently {bot}:</p>
					<button
						style="width: 30%; margin: 0%; background-color: gray; border-radius: 5px;"
						on:click={() => (bot = 'X')}
						>Set <span style="color: red;">X</span>
					</button>
					<button
						style="width: 30%; margin: 0%; background-color: gray; border-radius: 5px;"
						on:click={() => (bot = 'O')}
						>Set <span style="color: blue;">O</span>
					</button>
					<button
						style="width: 30%; margin: 0%; background-color: gray; border-radius: 5px;"
						on:click={() => (bot = 'NoN')}
						>Set <span style="color: lightgreen;">NoN</span>
					</button>

					<p style="margin-top: 20px; margin-bottom: 0">
						Start Player is currently {firstPlayerSetting}:
					</p>
					<p style="margin-top: 0px;">Set:</p>
					<button
						style="width: 30%; margin: 0%; background-color: gray; border-radius: 5px; color: red"
						on:click={() => (firstPlayerSetting = 'X')}
						>X
					</button>
					<button
						style="width: 30%; margin: 0%; background-color: gray; border-radius: 5px; color: blue"
						on:click={() => (firstPlayerSetting = 'O')}
						>O
					</button>
					<button
						style="width: 30%; margin: 0%; background-color: gray; border-radius: 5px; color: lightgreen"
						on:click={() => (firstPlayerSetting = 'random')}
						>random
					</button>
				</div>
			{/if}
		</div>
		<div style="width: 100%;">
			<button class="button" on:click={() => reset()}> Start New Game </button>
			<button
				class="button"
				on:click={() => (settings = true)}
				style="width: 30px; background-color: green"
			>
				⚙️
			</button>
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
		min-width: 250px;
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
