<script lang="ts">
	import { onMount } from 'svelte'
	import {
		doc as firestoreDoc,
		getDoc,
		setDoc,
		deleteDoc,
		onSnapshot,
		collection,
		getDocs,
		query,
		where,
		serverTimestamp,
	} from 'firebase/firestore'
	import { db } from './firebase'
	// @ts-expect-error Cross is importet via vite
	import cross from '../assets/Cross.png'
	// @ts-expect-error Circle is importet via vite
	import circle from '../assets/Circle.png'
	// @ts-expect-error Stroke is importet via vite
	import stroke from '../assets/Stroke.png'

	//-------------------------------------------------------------------------------------------------------------------------------------------------

	let localupdate = false
	let usersymbol: string = ''

	let chat: string[] = []

	let grid: string[][] = []
	let overallgrid: string[]
	let player: string
	let lastMoveIndex: number = 99
	let won: string = '0'

	let screen = 'start'
	let gameId: string = Math.floor(Math.random() * 10000)
		.toString()
		.padStart(4, '0')

	let boardRef = firestoreDoc(db, 'tictactoeUltimate', gameId)

	let chatGUI: boolean = false
	let chatInput: string = ''
	let chatContainer: HTMLDivElement | null = null

	//-----------------------------------ONLINE FUNCTIONS-----------------------------------------------------------------------------------------------

	function chunkArray(array: string[], chunkSize: number): string[][] {
		console.log(array)
		const result: string[][] = []

		for (let i = 0; i < 81; i += chunkSize) {
			const chunk: string[] = []

			for (let j = 0; j < chunkSize; j++) {
				chunk.push(array[i + j])
			}

			result.push(chunk)
		}

		return result
	}

	async function loadBoard(): Promise<void> {
		const gridflat = grid.flat()
		const overallgridon = overallgrid
		const playeron = player
		const lastMoveIndexon = lastMoveIndex
		const wonon = won
		const chaton = chat
		const boardSnap = await getDoc(boardRef)

		if (boardSnap.exists()) {
			const data = boardSnap.data()
			grid = chunkArray(data.gridflat as string[], 9)
			overallgrid = data.overallgridon as string[]
			player = data.playeron as string
			lastMoveIndex = data.lastMoveIndexon as number
			won = data.wonon as string
			chat = data.chaton as string[]
		} else {
			await setDoc(boardRef, {
				gridflat,
				overallgridon,
				playeron,
				lastMoveIndexon,
				wonon,
				chaton,
				createdAt: serverTimestamp(),
			})
		}
	}

	async function saveBoard(): Promise<void> {
		const gridflat = grid.flat()
		const overallgridon = overallgrid
		const playeron = player
		const lastMoveIndexon = lastMoveIndex
		const wonon = won
		const chaton = chat
		await setDoc(boardRef, { gridflat }, { merge: true })
		await setDoc(boardRef, { overallgridon }, { merge: true })
		await setDoc(boardRef, { playeron }, { merge: true })
		await setDoc(boardRef, { lastMoveIndexon }, { merge: true })
		await setDoc(boardRef, { wonon }, { merge: true })
		await setDoc(boardRef, { chaton }, { merge: true })
	}

	async function deleteBoard(): Promise<void> {
		try {
			await deleteDoc(boardRef)
			console.log('Dokument erfolgreich gelöscht.')
		} catch (error) {
			console.error('Fehler beim Löschen des Dokuments:', error)
		}
	}

	async function cleanUpOldGames(): Promise<void> {
		const gamesCollection = collection(db, 'tictactoeUltimate')
		const now = new Date()
		const duration = new Date(now.getTime() - 180 * 60 * 1000)

		const q = query(gamesCollection, where('createdAt', '<', duration))
		const querySnapshot = await getDocs(q)

		querySnapshot.forEach((doc) => {
			deleteDoc(doc.ref)
				.then(() => {
					console.log(
						`Spiel ${doc.id} gelöscht, da es älter als 20 Minuten ist.`
					)
				})
				.catch((error) => {
					console.error(`Fehler beim Löschen von Spiel ${doc.id}:`, error)
				})
		})
	}

	function start(event: Event) {
		console.log('game init')
		event.preventDefault()

		if (gameId.length === 4) {
			boardRef = firestoreDoc(db, 'tictactoeUltimate', gameId)
		}

		loadBoard().catch((error) => {
			console.error('Error:', error)
		})

		const unsubscribe = onSnapshot(boardRef, (snapshot) => {
			if (snapshot.exists() && !localupdate) {
				const data = snapshot.data()
				grid = chunkArray(data.gridflat as string[], 9)
				overallgrid = data.overallgridon as string[]
				player = data.playeron as string
				lastMoveIndex = data.lastMoveIndexon as number
				won = data.wonon as string
				chat = data.chaton as string[]
			}
		})

		return () => {
			unsubscribe()
			deleteBoard().catch((error) => {
				console.error('Error:', error)
			})
		}
	}

	onMount(() => {
		cleanUpOldGames().catch((error) => {
			console.error('Fehler beim Aufräumen der alten Spiele:', error)
		})

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault()
			deleteBoard().catch((error) => {
				console.error('Error:', error)
			})
			return (event.returnValue = '')
		}

		window.addEventListener('beforeunload', handleBeforeUnload)

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload)
		}
	})

	//-----------------------------------ONLINE FUNCTIONS END-------------------------------------------------------------------------------------------

	const winMoves: number[][] = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	]

	function checkwin() {
		for (let n = 0; n < 9; n++) {
			for (let i = 0; i < winMoves.length; i++) {
				const a = grid[n][winMoves[i][0]]
				const b = grid[n][winMoves[i][1]]
				const c = grid[n][winMoves[i][2]]

				if (a === 'X' && b === 'X' && c === 'X') overallgrid[n] = 'X'
				else if (a === 'O' && b === 'O' && c === 'O') overallgrid[n] = 'O'

				if (
					grid[n][0] !== '' &&
					grid[n][1] !== '' &&
					grid[n][2] !== '' &&
					grid[n][3] !== '' &&
					grid[n][4] !== '' &&
					grid[n][5] !== '' &&
					grid[n][6] !== '' &&
					grid[n][7] !== '' &&
					grid[n][8] !== '' &&
					overallgrid[n] === ''
				) {
					overallgrid[n] = '-'
				}
			}
		}
	}

	function checkOverallWin() {
		for (let i = 0; i < winMoves.length; i++) {
			const a = overallgrid[winMoves[i][0]]
			const b = overallgrid[winMoves[i][1]]
			const c = overallgrid[winMoves[i][2]]

			if (a === 'X' && b === 'X' && c === 'X') won = 'X'
			else if (a === 'O' && b === 'O' && c === 'O') won = 'O'
		}

		if (
			overallgrid[0] !== '' &&
			overallgrid[1] !== '' &&
			overallgrid[2] !== '' &&
			overallgrid[3] !== '' &&
			overallgrid[4] !== '' &&
			overallgrid[5] !== '' &&
			overallgrid[6] !== '' &&
			overallgrid[7] !== '' &&
			overallgrid[8] !== '' &&
			won === '0'
		) {
			won = '-'
		}
		if (won !== '0') lastMoveIndex = 99
	}

	async function registerMove(selectedgrid: number, cell: number) {
		if (usersymbol === '') usersymbol = player

		if (won === '0' && usersymbol === player) {
			if (grid[selectedgrid][cell] !== '') return
			if (selectedgrid !== lastMoveIndex && lastMoveIndex !== 99) return

			if (player === 'X') {
				grid[selectedgrid][cell] = 'X'
				player = 'O'
			} else {
				grid[selectedgrid][cell] = 'O'
				player = 'X'
			}
			lastMoveIndex = cell
			localupdate = true

			checkwin()
			if (overallgrid[lastMoveIndex] !== '') lastMoveIndex = 99
			checkOverallWin()

			await saveBoard().catch((error) => {
				console.error('Error:', error)
			})

			localupdate = false
		}
	}

	function reset() {
		const tmp = Math.floor(Math.random() * 2) + 1
		if (tmp === 1) player = 'X'
		else player = 'O'

		won = '0'
		grid = [
			['', '', '', '', '', '', '', '', ''],
			['', '', '', '', '', '', '', '', ''],
			['', '', '', '', '', '', '', '', ''],
			['', '', '', '', '', '', '', '', ''],
			['', '', '', '', '', '', '', '', ''],
			['', '', '', '', '', '', '', '', ''],
			['', '', '', '', '', '', '', '', ''],
			['', '', '', '', '', '', '', '', ''],
			['', '', '', '', '', '', '', '', ''],
		]
		overallgrid = ['', '', '', '', '', '', '', '', '']
		lastMoveIndex = 99
		usersymbol = ''
		chat = [
			'<div style="color: darkgray; text-align: center;"><span style="color: darkgray;">! Beginne zu spielen um zu sehen von wem welche Nachrichten sind.</span></div>',
		]
		chatInput = ''
		if (screen === 'off') {
			saveBoard().catch((error) => {
				console.error('Error:', error)
			})
		}
	}

	//---------------------------------------------------------------CHAT------------------------------------------------------------------------------

	function scrollToBottom() {
		setTimeout(() => {
			chatContainer?.scrollTo({
				top: chatContainer.scrollHeight,
				behavior: 'smooth',
			})
		}, 0)
	}

	function handleChatInput() {
		if (chatInput.trim() !== '') {
			console.log()
			if (chatInput.startsWith('!bild ')) {
				chatInput =
					'<img src="' +
					chatInput.slice(6).trim() +
					'" alt="' +
					chatInput.slice(6).trim() +
					'" />'
			} else if (usersymbol === 'O') {
				chatInput = '<span style="color: blue">- </span>' + chatInput
			} else if (usersymbol === 'X') {
				chatInput = '<span style="color: red">- </span>' + chatInput
			} else {
				chatInput = '<span style="color: darkgray">- </span>' + chatInput
			}
			chat = [...chat, chatInput]
			saveBoard().catch((error) => {
				console.error('Error:', error)
			})
			chatInput = ''

			scrollToBottom()
		}
	}

	reset()
</script>

<main>
	{#if screen === 'start'}
		<div
			style="position:absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: lightgray; height:100%; width: 100%; display: flex; justify-content: center;"
		>
			<h1
				style="margin-top: 50px; margin-bottom: 100px; width:100%; text-align:center; right: 0; position: absolute;"
			>
				TicTacToe Ultimate Online
			</h1>
			<button
				style="margin-top: 150px; margin-right: 20px; width: 120px; height: 40px; background-color: darkblue; color: white; border-radius: 10px"
				on:click={() => {
					screen = 'join'
					gameId = ''
				}}>Join Game</button
			>
			<button
				style="margin-top: 150px; width: 120px; height: 40px;  background-color: darkblue; color: white; border-radius: 10px"
				on:click={() => (screen = 'init')}>Start Game</button
			>
		</div>
	{/if}
	{#if screen === 'join'}
		<div
			style="position:absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: lightgray; height:100%; width: 100%"
		>
			<form
				on:submit={(event) => {
					start(event)
					screen = 'off'
				}}
				style="display: flex; justify-content: center; margin-top: 150px;"
			>
				<input
					style="width: 120px; text-align: center;  border-radius: 10px; height: 42px; text-align:center"
					type="text"
					id="gameID"
					bind:value={gameId}
					required
					maxlength="4"
					minlength="4"
					placeholder="X-X-X-X"
				/>
				<button
					type="submit"
					style="margin-left: 20px; width: 120px; height: 42px; background-color: darkblue; color: white; border-radius: 10px"
					>Join Game</button
				>
			</form>
		</div>
	{/if}
	{#if screen === 'init'}
		<div
			style="position:absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: lightgray; height:100%; width: 100%"
		>
			<form
				on:submit={(event) => {
					start(event)
					screen = 'off'
				}}
				style="display: flex; justify-content: center; margin-top: 150px"
			>
				<input
					style="width: 120px; text-align: center;  border-radius: 10px; height: 42px; text-align:center"
					type="text"
					id="gameID"
					bind:value={gameId}
					required
					maxlength="4"
					minlength="4"
					placeholder="X-X-X-X"
				/>
				<button
					type="submit"
					style="margin-left: 20px; width: 120px; height: 42px; background-color: darkblue; color: white; border-radius: 10px"
					>Start Game</button
				>
			</form>
		</div>
	{/if}

	{#if screen === 'off'}
		<div class="tictactoeholder">
			<h1 style="width:100%; margin-top: 30px">TicTacToe Ultimate</h1>
			<div style="width: 100%;">
				{#if player === 'X' && won === '0'}
					<p style="width: 100%; font-size:30px">
						Player <span style="color: red;">X</span> is
					</p>
				{:else if player === 'O' && won === '0'}
					<p style="width: 100%; font-size:30px">
						Player <span style="color: blue;">O</span> is
					</p>
				{:else if won === 'X'}
					<p style="color: red; width: 100%; font-size:30px">X won!</p>
				{:else if won === 'O'}
					<p style="color: blue; width: 100%; font-size:30px">O won!</p>
				{:else if won === '-'}
					<p style="width: 100%; font-size:30px">Unentschieden!</p>
				{/if}
			</div>
			<div class="tictactoefield">
				<div class="grid" id="overallgrid">
					<div class="cell" style="border-top-left-radius: 20px;">
						<div class="grid" id="grid0">
							{#if lastMoveIndex === 0}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; border: 4px solid yellow; pointer-events: none; border-top-left-radius: 17px;"
								/>
							{/if}
							{#if overallgrid[0] === 'X'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4; border-top-left-radius: 20px"
								/>
								<img
									src={cross}
									alt="Cross"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[0] === 'O'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4; border-top-left-radius: 20px"
								/>
								<img
									src={circle}
									alt="Circle"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[0] === '-'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4; border-top-left-radius: 20px"
								/>
								<img
									src={stroke}
									alt="tie"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{/if}
							<button
								on:click={() => registerMove(0, 0)}
								class="cell"
								style="border-top-left-radius: 20px;"
							>
								{#if grid[0][0] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[0][0] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(0, 1)} class="cell">
								{#if grid[0][1] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[0][1] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(0, 2)}
								class="cell"
								style="border-top-right-radius: 20px;"
							>
								{#if grid[0][2] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[0][2] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button on:click={() => registerMove(0, 3)} class="cell">
								{#if grid[0][3] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[0][3] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(0, 4)} class="cell">
								{#if grid[0][4] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[0][4] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(0, 5)} class="cell">
								{#if grid[0][5] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[0][5] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button
								on:click={() => registerMove(0, 6)}
								class="cell"
								style="border-bottom-left-radius: 20px;"
							>
								{#if grid[0][6] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[0][6] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(0, 7)} class="cell">
								{#if grid[0][7] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[0][7] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(0, 8)}
								class="cell"
								style="border-bottom-right-radius: 20px;"
							>
								{#if grid[0][8] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[0][8] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
						</div>
					</div>
					<div class="verticalBarrier" style="background-color: black;" />
					<div class="cell">
						<div class="grid" id="grid1">
							{#if lastMoveIndex === 1}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; border: 4px solid yellow; pointer-events: none;"
								/>
							{/if}
							{#if overallgrid[1] === 'X'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={cross}
									alt="Cross"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[1] === 'O'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={circle}
									alt="Circle"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[1] === '-'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={stroke}
									alt="tie"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{/if}
							<button
								on:click={() => registerMove(1, 0)}
								class="cell"
								style="border-top-left-radius: 20px;"
							>
								{#if grid[1][0] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[1][0] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(1, 1)} class="cell">
								{#if grid[1][1] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[1][1] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(1, 2)}
								class="cell"
								style="border-top-right-radius: 20px;"
							>
								{#if grid[1][2] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[1][2] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button on:click={() => registerMove(1, 3)} class="cell">
								{#if grid[1][3] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[1][3] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(1, 4)} class="cell">
								{#if grid[1][4] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[1][4] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(1, 5)} class="cell">
								{#if grid[1][5] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[1][5] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button
								on:click={() => registerMove(1, 6)}
								class="cell"
								style="border-bottom-left-radius: 20px;"
							>
								{#if grid[1][6] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[1][6] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(1, 7)} class="cell">
								{#if grid[1][7] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[1][7] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(1, 8)}
								class="cell"
								style="border-bottom-right-radius: 20px;"
							>
								{#if grid[1][8] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[1][8] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
						</div>
					</div>
					<div class="verticalBarrier" style="background-color: black;" />
					<div class="cell" style="border-top-right-radius: 20px;">
						<div class="grid" id="grid2">
							{#if lastMoveIndex === 2}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; border: 4px solid yellow; pointer-events: none; border-top-right-radius: 17px;"
								/>
							{/if}
							{#if overallgrid[2] === 'X'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4; border-top-right-radius: 20px"
								/>
								<img
									src={cross}
									alt="Cross"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[2] === 'O'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4; border-top-right-radius: 20px"
								/>
								<img
									src={circle}
									alt="Circle"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[2] === '-'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4; border-top-right-radius: 20px"
								/>
								<img
									src={stroke}
									alt="tie"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{/if}
							<button
								on:click={() => registerMove(2, 0)}
								class="cell"
								style="border-top-left-radius: 20px;"
							>
								{#if grid[2][0] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[2][0] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(2, 1)} class="cell">
								{#if grid[2][1] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[2][1] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(2, 2)}
								class="cell"
								style="border-top-right-radius: 20px;"
							>
								{#if grid[2][2] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[2][2] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button on:click={() => registerMove(2, 3)} class="cell">
								{#if grid[2][3] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[2][3] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(2, 4)} class="cell">
								{#if grid[2][4] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[2][4] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(2, 5)} class="cell">
								{#if grid[2][5] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[2][5] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button
								on:click={() => registerMove(2, 6)}
								class="cell"
								style="border-bottom-left-radius: 20px;"
							>
								{#if grid[2][6] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[2][6] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(2, 7)} class="cell">
								{#if grid[2][7] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[2][7] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(2, 8)}
								class="cell"
								style="border-bottom-right-radius: 20px;"
							>
								{#if grid[2][8] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[2][8] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
						</div>
					</div>

					<div class="horizontalBarrier" style="background-color: black;" />

					<div class="cell">
						<div class="grid" id="grid3">
							{#if lastMoveIndex === 3}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; border: 4px solid yellow; pointer-events: none;"
								/>
							{/if}
							{#if overallgrid[3] === 'X'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={cross}
									alt="Cross"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[3] === '-'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={stroke}
									alt="tie"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[3] === 'O'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={circle}
									alt="Circle"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{/if}
							<button
								on:click={() => registerMove(3, 0)}
								class="cell"
								style="border-top-left-radius: 20px;"
							>
								{#if grid[3][0] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[3][0] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(3, 1)} class="cell">
								{#if grid[3][1] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[3][1] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(3, 2)}
								class="cell"
								style="border-top-right-radius: 20px;"
							>
								{#if grid[3][2] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[3][2] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button on:click={() => registerMove(3, 3)} class="cell">
								{#if grid[3][3] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[3][3] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(3, 4)} class="cell">
								{#if grid[3][4] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[3][4] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(3, 5)} class="cell">
								{#if grid[3][5] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[3][5] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button
								on:click={() => registerMove(3, 6)}
								class="cell"
								style="border-bottom-left-radius: 20px;"
							>
								{#if grid[3][6] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[3][6] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(3, 7)} class="cell">
								{#if grid[3][7] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[3][7] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(3, 8)}
								class="cell"
								style="border-bottom-right-radius: 20px;"
							>
								{#if grid[3][8] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[3][8] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
						</div>
					</div>
					<div class="verticalBarrier" style="background-color: black;" />
					<div class="cell">
						<div class="grid" id="grid4">
							{#if lastMoveIndex === 4}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; border: 4px solid yellow; pointer-events: none;"
								/>
							{/if}
							{#if overallgrid[4] === 'X'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={cross}
									alt="Cross"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[4] === 'O'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={circle}
									alt="Circle"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[4] === '-'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={stroke}
									alt="tie"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{/if}
							<button
								on:click={() => registerMove(4, 0)}
								class="cell"
								style="border-top-left-radius: 20px;"
							>
								{#if grid[4][0] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[4][0] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(4, 1)} class="cell">
								{#if grid[4][1] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[4][1] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(4, 2)}
								class="cell"
								style="border-top-right-radius: 20px;"
							>
								{#if grid[4][2] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[4][2] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button on:click={() => registerMove(4, 3)} class="cell">
								{#if grid[4][3] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[4][3] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(4, 4)} class="cell">
								{#if grid[4][4] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[4][4] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(4, 5)} class="cell">
								{#if grid[4][5] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[4][5] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button
								on:click={() => registerMove(4, 6)}
								class="cell"
								style="border-bottom-left-radius: 20px;"
							>
								{#if grid[4][6] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[4][6] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(4, 7)} class="cell">
								{#if grid[4][7] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[4][7] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(4, 8)}
								class="cell"
								style="border-bottom-right-radius: 20px;"
							>
								{#if grid[4][8] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[4][8] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
						</div>
					</div>
					<div class="verticalBarrier" style="background-color: black;" />
					<div class="cell">
						<div class="grid" id="grid5">
							{#if lastMoveIndex === 5}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; border: 4px solid yellow; pointer-events: none;"
								/>
							{/if}
							{#if overallgrid[5] === 'X'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={cross}
									alt="Cross"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[5] === 'O'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={circle}
									alt="Circle"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[5] === '-'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={stroke}
									alt="tie"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{/if}
							<button
								on:click={() => registerMove(5, 0)}
								class="cell"
								style="border-top-left-radius: 20px;"
							>
								{#if grid[5][0] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[5][0] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(5, 1)} class="cell">
								{#if grid[5][1] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[5][1] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(5, 2)}
								class="cell"
								style="border-top-right-radius: 20px;"
							>
								{#if grid[5][2] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[5][2] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button on:click={() => registerMove(5, 3)} class="cell">
								{#if grid[5][3] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[5][3] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(5, 4)} class="cell">
								{#if grid[5][4] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[5][4] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(5, 5)} class="cell">
								{#if grid[5][5] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[5][5] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button
								on:click={() => registerMove(5, 6)}
								class="cell"
								style="border-bottom-left-radius: 20px;"
							>
								{#if grid[5][6] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[5][6] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(5, 7)} class="cell">
								{#if grid[5][7] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[5][7] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(5, 8)}
								class="cell"
								style="border-bottom-right-radius: 20px;"
							>
								{#if grid[5][8] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[5][8] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
						</div>
					</div>

					<div class="horizontalBarrier" style="background-color: black;" />

					<div class="cell" style="border-bottom-left-radius: 20px;">
						<div class="grid" id="grid6">
							{#if lastMoveIndex === 6}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; border: 4px solid yellow; pointer-events: none; border-bottom-left-radius: 17px;"
								/>
							{/if}
							{#if overallgrid[6] === 'X'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4; border-bottom-left-radius: 20px"
								/>
								<img
									src={cross}
									alt="Cross"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[6] === 'O'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4; border-bottom-left-radius: 20px"
								/>
								<img
									src={circle}
									alt="Circle"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[6] === '-'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4; border-bottom-left-radius: 20px"
								/>
								<img
									src={stroke}
									alt="tie"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{/if}
							<button
								on:click={() => registerMove(6, 0)}
								class="cell"
								style="border-top-left-radius: 20px;"
							>
								{#if grid[6][0] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[6][0] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(6, 1)} class="cell">
								{#if grid[6][1] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[6][1] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(6, 2)}
								class="cell"
								style="border-top-right-radius: 20px;"
							>
								{#if grid[6][2] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[6][2] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button on:click={() => registerMove(6, 3)} class="cell">
								{#if grid[6][3] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[6][3] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(6, 4)} class="cell">
								{#if grid[6][4] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[6][4] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(6, 5)} class="cell">
								{#if grid[6][5] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[6][5] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button
								on:click={() => registerMove(6, 6)}
								class="cell"
								style="border-bottom-left-radius: 20px;"
							>
								{#if grid[6][6] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[6][6] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(6, 7)} class="cell">
								{#if grid[6][7] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[6][7] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(6, 8)}
								class="cell"
								style="border-bottom-right-radius: 20px;"
							>
								{#if grid[6][8] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[6][8] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
						</div>
					</div>
					<div class="verticalBarrier" style="background-color: black;" />
					<div class="cell">
						<div class="grid" id="grid7">
							{#if lastMoveIndex === 7}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; border: 4px solid yellow; pointer-events: none;"
								/>
							{/if}
							{#if overallgrid[7] === 'X'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={cross}
									alt="Cross"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[7] === 'O'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={circle}
									alt="Circle"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[7] === '-'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4;"
								/>
								<img
									src={stroke}
									alt="tie"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{/if}
							<button
								on:click={() => registerMove(7, 0)}
								class="cell"
								style="border-top-left-radius: 20px;"
							>
								{#if grid[7][0] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[7][0] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(7, 1)} class="cell">
								{#if grid[7][1] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[7][1] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(7, 2)}
								class="cell"
								style="border-top-right-radius: 20px;"
							>
								{#if grid[7][2] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[7][2] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button on:click={() => registerMove(7, 3)} class="cell">
								{#if grid[7][3] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[7][3] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(7, 4)} class="cell">
								{#if grid[7][4] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[7][4] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(7, 5)} class="cell">
								{#if grid[7][5] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[7][5] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button
								on:click={() => registerMove(7, 6)}
								class="cell"
								style="border-bottom-left-radius: 20px;"
							>
								{#if grid[7][6] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[7][6] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(7, 7)} class="cell">
								{#if grid[7][7] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[7][7] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(7, 8)}
								class="cell"
								style="border-bottom-right-radius: 20px;"
							>
								{#if grid[7][8] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[7][8] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
						</div>
					</div>
					<div class="verticalBarrier" style="background-color: black;" />
					<div class="cell" style="border-bottom-right-radius: 20px;">
						<div class="grid" id="grid8">
							{#if lastMoveIndex === 8}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; border: 4px solid yellow; pointer-events: none; border-bottom-right-radius: 17px;"
								/>
							{/if}
							{#if overallgrid[8] === 'X'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4; border-bottom-right-radius: 20px"
								/>
								<img
									src={cross}
									alt="Cross"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[8] === 'O'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4; border-bottom-right-radius: 20px"
								/>
								<img
									src={circle}
									alt="Circle"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{:else if overallgrid[8] === '-'}
								<div
									style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-color: black; opacity: 0.4; border-bottom-right-radius: 20px"
								/>
								<img
									src={stroke}
									alt="tie"
									style="width: 80%; margin: 10%; position: absolute; left: 0; right: 0;"
								/>
							{/if}
							<button
								on:click={() => registerMove(8, 0)}
								class="cell"
								style="border-top-left-radius: 20px;"
							>
								{#if grid[8][0] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[8][0] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(8, 1)} class="cell">
								{#if grid[8][1] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[8][1] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(8, 2)}
								class="cell"
								style="border-top-right-radius: 20px;"
							>
								{#if grid[8][2] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[8][2] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button on:click={() => registerMove(8, 3)} class="cell">
								{#if grid[8][3] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[8][3] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(8, 4)} class="cell">
								{#if grid[8][4] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[8][4] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(8, 5)} class="cell">
								{#if grid[8][5] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[8][5] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>

							<div class="horizontalBarrier" />

							<button
								on:click={() => registerMove(8, 6)}
								class="cell"
								style="border-bottom-left-radius: 20px;"
							>
								{#if grid[8][6] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[8][6] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button on:click={() => registerMove(8, 7)} class="cell">
								{#if grid[8][7] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[8][7] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
							<div class="verticalBarrier" />
							<button
								on:click={() => registerMove(8, 8)}
								class="cell"
								style="border-bottom-right-radius: 20px;"
							>
								{#if grid[8][8] === 'X'}
									<img
										src={cross}
										alt="Cross"
										style="width: 80%; margin: 10%;"
									/>
								{:else if grid[8][8] === 'O'}
									<img
										src={circle}
										alt="Circle"
										style="width: 80%; margin: 10%;"
									/>
								{/if}
							</button>
						</div>
					</div>
				</div>
			</div>
			<div style="width: 100%;">
				<button class="button" on:click={() => reset()}>
					Start New Game
				</button>
				<p style="margin-top: 20px;">GameID: {gameId}</p>
			</div>
		</div>
	{/if}
	{#if screen === 'off'}
		<button
			on:click={() => (chatGUI = !chatGUI)}
			style="background-color: lightblue; position: absolute; top: 8px; right: 8px; width: 42px; height: 42px; border-radius: 3px; font-size: 25px"
		>
			C
		</button>
	{/if}

	{#if chatGUI}
		<button
			on:click={() => (chatGUI = !chatGUI)}
			style="background-color: lightblue; position: absolute; top: 8px; right: 338px; width: 42px; height: 42px; border-radius: 3px; font-size: 25px"
		>
			C
		</button>
		<div
			style="border-color: lightgray; border-width: 2px; background-color: white; width: 330px; position: absolute; right: 0; bottom: 0; top: 0; padding: 10px; padding-bottom: 55px"
		>
			<!-- Nachrichtenbereich -->
			<div
				bind:this={chatContainer}
				style="overflow-y: auto; max-height: calc(100% - 40px); margin-bottom: 55px;"
			>
				<ul>
					{#each chat as message}
						<li style="font-size: 20px;">{@html message}</li>
					{/each}
				</ul>
			</div>

			<input
				required
				type="text"
				bind:value={chatInput}
				style="border-radius: 8px; border-color: blue; width: 250px; margin: 10px; height: 42px; position: absolute; right: 60px; bottom: 0px; border-bottom-right-radius: 0; border-top-right-radius: 0"
			/>

			<button
				on:click={handleChatInput}
				style="position: absolute; bottom: 10px; right: 10px; border-radius: 8px; height: 42px; width: 60px; background-color: blue; border-bottom-left-radius: 0; border-top-left-radius: 0"
			>
				Send
			</button>
		</div>
	{/if}
</main>

<style>
	.tictactoefield {
		display: block;
		justify-content: center;
		margin: 5px;
		margin-top: 10px;
		position: relative;
	}

	.grid {
		max-width: 60vh;
		display: grid;
		position: relative;
		grid-template-columns: 250fr 1fr 250fr 1fr 250fr;
	}

	.cell {
		display: flex;
		aspect-ratio: 1 / 1;
		background-color: rgb(164, 162, 162);
	}

	.verticalBarrier {
		background-color: grey;
		width: 3px;
	}

	.horizontalBarrier {
		background-color: grey;
		height: 3px;
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
