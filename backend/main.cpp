#include <iostream>
#include <vector>
#include <cstdlib>
#include <ctime>
#include <string>
using namespace std;

// MazeQuest C++ DSA implementation.
// This file is the native C++ version for local compilation/practical demonstration.
// The Vercel deployment uses frontend/script.js because Vercel static hosting does not
// run a persistent native C++ server.

class stack {
    int data[2000];
    int top;
public:
    stack() : top(-1) {}
    bool isempty() { return top == -1; }
    void push(int value) { if (top < 1999) data[++top] = value; }
    int pop() { if (isempty()) return -1; return data[top--]; }
    int peek() { if (isempty()) return -1; return data[top]; }
};

class queue {
    int data[2000];
    int front, rear, count;
public:
    queue() : front(0), rear(-1), count(0) {}
    bool isempty() { return count == 0; }
    void enqueue(int value) {
        if (count == 2000) return;
        rear = (rear + 1) % 2000;
        data[rear] = value;
        count++;
    }
    int dequeue() {
        if (isempty()) return -1;
        int value = data[front];
        front = (front + 1) % 2000;
        count--;
        return value;
    }
};

class maze {
    int rows, cols;
    vector<vector<char>> grid;
public:
    maze(int size = 21) {
        rows = size;
        cols = size == 11 ? 15 : size == 21 ? 31 : 45;
        grid.assign(rows, vector<char>(cols, '#'));
    }

    void generate() {
        grid.assign(rows, vector<char>(cols, '#'));
        stack st;
        grid[1][1] = ' ';
        st.push(cols + 1);
        int dr[4] = {-2, 2, 0, 0}, dc[4] = {0, 0, -2, 2};
        while (!st.isempty()) {
            int current = st.peek(), r = current / cols, c = current % cols;
            int next_r[4], next_c[4], count = 0;
            for (int i = 0; i < 4; i++) {
                int nr = r + dr[i], nc = c + dc[i];
                if (nr > 0 && nr < rows-1 && nc > 0 && nc < cols-1 && grid[nr][nc] == '#') {
                    next_r[count] = nr; next_c[count] = nc; count++;
                }
            }
            if (count) {
                int choice = rand() % count, nr = next_r[choice], nc = next_c[choice];
                grid[(r+nr)/2][(c+nc)/2] = ' ';
                grid[nr][nc] = ' ';
                st.push(nr * cols + nc);
            } else st.pop();
        }
        grid[1][1] = 'S'; grid[rows-2][cols-2] = 'E';
    }

    bool solve(string algo, int &pathlength, int &explored) {
        for (int r=0;r<rows;r++) for(int c=0;c<cols;c++) if(grid[r][c]=='.') grid[r][c]=' ';
        vector<int> parent(rows*cols,-1);
        vector<vector<int>> visited(rows,vector<int>(cols,0));
        int start=cols+1, finish=(rows-2)*cols+cols-2;
        stack st; queue q;
        if(algo=="bfs") q.enqueue(start); else st.push(start);
        visited[1][1]=1; explored=0; pathlength=0;
        int dr[4]={-1,1,0,0}, dc[4]={0,0,-1,1}; bool found=false;
        while(algo=="bfs" ? !q.isempty() : !st.isempty()) {
            int current=algo=="bfs" ? q.dequeue() : st.pop(); explored++;
            if(current==finish){found=true;break;}
            int r=current/cols,c=current%cols;
            for(int i=0;i<4;i++){
                int nr=r+dr[i],nc=c+dc[i];
                if(nr<0||nr>=rows||nc<0||nc>=cols||grid[nr][nc]=='#'||visited[nr][nc]) continue;
                visited[nr][nc]=1; int next=nr*cols+nc; parent[next]=current;
                if(algo=="bfs") q.enqueue(next); else st.push(next);
            }
        }
        if(!found) return false;
        int current=finish;
        while(current!=start){
            int r=current/cols,c=current%cols;
            if(grid[r][c]!='E') grid[r][c]='.';
            current=parent[current]; pathlength++;
        }
        grid[1][1]='S'; grid[rows-2][cols-2]='E';
        return true;
    }

    void display() {
        for (const auto &row : grid) {
            for (char cell : row) cout << cell << ' ';
            cout << '\n';
        }
    }
};

int main() {
    srand(static_cast<unsigned int>(time(nullptr)));
    maze m;
    m.generate();
    cout << "MAZEQUEST - Generated maze\n";
    m.display();

    int pathlength = 0, explored = 0;
    cout << "\nBFS:\n";
    if (m.solve("bfs", pathlength, explored))
        cout << "Path length: " << pathlength << " | Cells explored: " << explored << "\n";
    else cout << "No path found\n";
    m.display();

    cout << "\nDFS:\n";
    if (m.solve("dfs", pathlength, explored))
        cout << "Path length: " << pathlength << " | Cells explored: " << explored << "\n";
    else cout << "No path found\n";
    m.display();
    return 0;
}
