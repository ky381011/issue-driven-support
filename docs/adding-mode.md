# モードの追加方法

このActionは `MODE` 入力で実行する機能を切り替えます。新しい機能（モード）は、次の3つで追加できます。

1. `src/<mode>.js` を作る
2. `action.yml` の `modes` 配列にモード名を足す
3. そのモードで使う入力を `<MODE>_*` という名前で `inputs` と `env` に追加する

以下、`sample` というモードを追加する場合の例です。

## 1. `src/<mode>.js` を作る

`actions/github-script` から呼ばれる関数を CommonJS 形式でエクスポートします。

```js
// src/sample.js
module.exports = async ({ github, context, core }) => {
  const { SAMPLE_MESSAGE: MESSAGE } = process.env;
  core.info(MESSAGE);
};
```

- `github`：認証済みの Octokit クライアント（`github.rest.issues.addLabels` など）
- `context`：イベントの情報（`context.repo`、`context.payload.issue` など）
- `core`：`@actions/core`（`core.info`、`core.setFailed` など）

## 2. `action.yml` の `modes` 配列にモード名を足す

```js
const modes = ['sample'];
```

`modes` にないモード名を指定すると、Actionはエラーで終了します。任意のファイルを読み込ませないための制限です。

## 3. 入力を `<MODE>_*` という名前で `inputs` と `env` に追加する

```yaml
inputs:
  # sample: Print a message
  SAMPLE_MESSAGE:
    description: "[sample] Message to print"
    default: hello
```

```yaml
      env:
        SAMPLE_MESSAGE: ${{ inputs.SAMPLE_MESSAGE }}
```

- 入力名は大文字にし、モード名を先頭に付けて、どのモード用かわかるようにします。
- `description` の先頭に `[<mode>]` を付けます。
- 全モード共通の入力（`MODE`、`GITHUB_TOKEN`）には接頭辞を付けません。

## 利用側のワークフロー

```yaml
- uses: ky381011/issue-driven-supporter@main
  with:
    MODE: sample
    SAMPLE_MESSAGE: hi
```
