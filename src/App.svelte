<script lang="ts">
	import TicTacToe from "./lib/TicTacToe.svelte";
	import TicTacToeAdvanced from "./lib/TicTacToeAdvanced.svelte";
	import UltimateTicTacToe from "./lib/UltimateTicTacToe.svelte";

	//import UltimateTicTacToeOnline from "./lib/UltimateTicTacToeOnline.svelte";
</script>

<!--
Game Selection:
use "<{Gamename} />" to cicle between the games (TicTacToe is standard).

{Gamename} can be:

-"TicTacToe" => BasicVersion
-"TicTacToeAdvanced" => BasicVersion but with an option for a bot and an selection for the starting player
-"UltimateTicTacToe" => UltimateTicTacToe is a version with nine boads merged to one (see instructions on Github pojekts readme)
(-"UltimateTicTacToeOnline" => UltimateTicTacToe but with two devices /!\ requires additional setup with firebase by Google)

-->
<TicTacToe />
