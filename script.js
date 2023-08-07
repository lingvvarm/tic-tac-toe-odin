"use strict";

const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const choiceText = document.querySelector('.choice-text');
const options_btns = document.querySelectorAll('.option');
const closeModalButton = document.querySelector('.close-modal-btn');
const formElement = document.getElementById("my-form");
const p2Label = document.getElementById('p2-label');
const p2Input = document.getElementById('p2');
const gameBlock = document.querySelector('.game-block');
const cell_btns = document.querySelectorAll('.cell');
const reset_btn = document.querySelector('.reset-btn');
const p1_icon = document.querySelector('.player1-icon');
const p2_icon = document.querySelector('.player2-icon');
const p1_text = document.querySelector('.player1-name');
const p2_text = document.querySelector('.player2-name');
const p1_score = document.querySelector('.player1-score');
const p2_score = document.querySelector('.player2-score');
const turn_text = document.querySelector('.turn-text');

options_btns.forEach((btn) => btn.addEventListener('click', function() {
    openModal(btn.getAttribute('option-type'));
}));


closeModalButton.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);


function openModal(type) {
    if (type == 'vs-cpu') {
        p2Input.value = "";
        p2Input.removeAttribute('required', 'minlength');
        p2Input.classList.add('hidden');
        p2Label.classList.add('hidden');
    }
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
};

function closeModal() {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
    formElement.reset();
    p2Input.classList.remove('hidden');
    p2Label.classList.remove('hidden');
}

function init_game(p1, p2) {
    if (controller.getCurrentTurn() == "p2") {
        controller.manually_switch_turn();
    }
    choiceText.classList.add('hidden');
    options_btns.forEach((btn) => btn.classList.add('hidden'));
    gameBlock.classList.remove('hidden');
    p1_icon.classList.add('player1-active');
    p2_icon.classList.remove('player2-active');
    p1_text.textContent = p1;
    p2_text.textContent = p2 || "CPU";
    turn_text.textContent = p1_text.textContent + "'s turn";

    cell_btns.forEach((cell) => cell.addEventListener('click', function() {
        cell_func(cell);
    }));
}

function cell_func(cell) {
    if (!(board.getWinnerName())) {
        let index = cell.getAttribute('num') - 1;
        if (board.getCell(index) != "") return;
        let cur_turn = controller.getCurrentTurn();
        let mark = (cur_turn == 'p1') ? "X": "O";
        board.fillCell(index, mark);
        controller.passTurn();
        if (p2_text.textContent == "CPU") {
            board.make_cpu_move();
            controller.passTurn();
        }
        board.check_winner();
    }
}


formElement.addEventListener('submit', (event) => {
    event.preventDefault()
    let formData = new FormData(formElement);
    let p1_name = formData.get('p1');
    let p2_name = formData.get('p2')
    closeModal();
    init_game(p1_name, p2_name);
});


const GameBoard = function(arg_cells=['', '', '', '', '', '', '', '', '']) {
    let cells = arg_cells;
    let cur_win_combination;
    let winner_name;
    let player1_score = 0, player2_score = 0;

    let win_combinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
                            [0, 3, 6], [1, 4, 7], [2, 5, 8],
                            [0, 4, 8], [2, 4, 6]];
    
    const fillCell = function(index, mark) {
        if (index < 0 || index > cells.length - 1) return;
        cells[index] = mark;
        update();
    }

    const getCell = function(index) {
        if (index < 0 || index > cells.length - 1) return;
        return cells[index];
    }

    const getBoard = function() {
        return cells;
    }

    const getWinnerName = function() {
        return winner_name;
    }

    const update = function() {
        for (let i = 0; i < cells.length; i++) {
            let cell = document.querySelector(`.cell:nth-child(${i+1})`);
            cell.classList.remove('cell-cross', 'cell-circle');
            if (cells[i] == "X") {
                cell.classList.add('cell-cross');
            }
            else if (cells[i] == "O") {
                cell.classList.add('cell-circle'); 
            }
        }
    }

    const reset = function() {
        cells = ['', '', '', '', '', '', '', '', ''];
        cur_win_combination = null;
        winner_name = null;
        cell_btns.forEach((cell) => {
            cell.classList.remove('cell-win');
        });
        update();
    }

    const mark_check = function(mark, index) {
        return cells[index] === mark;
    }

    const highlight_win_comb = function() {
        if (cur_win_combination) {
            for (let i of cur_win_combination) {
                let cell_to_highlight = document.querySelector(`.cell:nth-child(${i + 1}`);
                cell_to_highlight.classList.add('cell-win');
            }
        }
        turn_text.textContent = (winner_name == 'draw') ? "Draw!": winner_name + " wins!";
        p1_score.textContent = `Score: ${player1_score}`;
        p2_score.textContent = `Score: ${player2_score}`;
    }

    const check_winner = function() {
        for (let comb of win_combinations) {
            if (comb.every((elem) => mark_check("X", elem))) {
                cur_win_combination = comb;
                winner_name = p1_text.textContent;
                player1_score += 1;
                highlight_win_comb();
                break;
            }
            else if (comb.every((elem) => mark_check("O", elem))) {
                cur_win_combination = comb;
                winner_name = p2_text.textContent;
                player2_score += 1;
                highlight_win_comb();
                break;
            }
        }
        if (isFull() && !(winner_name)) {
            winner_name = 'draw';
            highlight_win_comb();
        }
    }

    function get_legal_moves(lst) {
        let legal = [];
        cells.forEach((elem, index) => {
          if (elem == "") {
            legal.push(index);
          }
        });
        return legal;
      }

    const make_cpu_move = function() {
        let possible = get_legal_moves(cells);
        let randomMove = possible[Math.floor(Math.random() * possible.length)];
        fillCell(randomMove, "O");
    }

    const isEmpty = function() {
        return cells.every((cell) => !cell);
    }

    const isFull = function() {
        return cells.every((cell) => cell);
    }

    return {fillCell, getCell, getBoard, reset, check_winner, make_cpu_move, getWinnerName};
}


const GameController = function() {
    let current_turn = 'p1'

    const passTurn = function() {
        if (current_turn == 'p1') {
            current_turn = 'p2';
            p1_icon.classList.remove('player1-active');
            p2_icon.classList.add('player2-active');
            turn_text.textContent = p2_text.textContent + "'s turn";
            
        }
        else if (current_turn == 'p2') {
            current_turn = 'p1';
            p1_icon.classList.add('player1-active');
            p2_icon.classList.remove('player2-active');
            turn_text.textContent = p1_text.textContent + "'s turn";
        }
    }

    const manually_switch_turn = function() {
        if (current_turn == 'p1') {
            current_turn = 'p2';
        }
        else if (current_turn == 'p2') {
            current_turn = 'p1';
        }
    }

    const getCurrentTurn = function() {
        return current_turn;
    }

    return {passTurn, getCurrentTurn, manually_switch_turn};
}


let board = GameBoard();
let controller = GameController();

reset_btn.addEventListener('click', function() {
    board.reset()
    init_game(p1_text.textContent, p2_text.textContent);
})

