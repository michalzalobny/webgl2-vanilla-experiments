#include <iostream>
#include <math.h>
#include "Application.h"

int main(int argc, char* args[]) {
  Application app;
  app.Setup(1200, 320, 10);

  while (app.IsRunning()) {
    app.Input();
    app.Update();
    app.Render();
  }
    
  app.Destroy();
  return 0;
}




#include <vector>
#include "Mouse.h"
#include "Renderer.h"
#include "Cloth.h"

struct Application {
  private:
    Renderer* renderer = nullptr;
    Mouse* mouse = nullptr;
    Cloth* cloth = nullptr;

    bool isRunning = false;

    Uint32 lastUpdateTime;

  public:
    Application() = default;
    ~Application() = default;
  
    bool IsRunning() const;

    void Setup(int clothWidth, int clothHeight, int clothSpacing);
    void Input();
    void Update();
    void Render() const;
    
    void Destroy();
};




#include "Vec2.h"

class Mouse {
  private:
    Vec2 pos;
    Vec2 prevPos;

    float cursorSize = 20;
    float maxCursorSize = 100;
    float minCursorSize = 20;

    bool leftButtonDown = false;
    bool rightButtonDown = false;

  public:
    Mouse() = default;
    ~Mouse() = default;

    void UpdatePosition(int x, int y);
    const Vec2& GetPosition() const { return pos; }
    const Vec2& GetPreviousPosition() const {return prevPos; }

    bool GetLeftButtonDown() const { return leftButtonDown; }
    void SetLeftMouseButton(bool state) { this->leftButtonDown = state; }

    bool GetRightMouseButton() const { return rightButtonDown; }
    void SetRightMouseButton(bool state) { this->rightButtonDown = state; }

    void IncreaseCursorSize(float increment);
    float GetCursorSize() const { return cursorSize; }
};


void Application::Update() {	
  Uint32 currentTime = SDL_GetTicks();
  float deltaTime = (currentTime - lastUpdateTime) / 1000.0f;

  cloth->Update(renderer, mouse, deltaTime);

  lastUpdateTime = currentTime;
}



#include <vector>
#include "Point.h"
#include "Stick.h"

class Cloth{
  private:
    Vec2 gravity = { 0.0f, 981.0f };
    float drag = 0.01f;
    float elasticity = 10.0f;

    std::vector points;
    std::vector sticks;

  public:
    Cloth() = default;
    Cloth(int width, int height, int spacing, int startX, int startY);
    ~Cloth();

    void Update(Renderer* renderer, Mouse* mouse, float deltaTime);
    void Draw(Renderer* renderer) const;
};




void Application::Setup(int clothWidth, int clothHeight, int clothSpacing) {
  renderer = new Renderer();
  mouse = new Mouse();
  
  isRunning = renderer->Setup();

  clothWidth /= clothSpacing;
  clothHeight /= clothSpacing;
  
  int startX = renderer->GetWindowWidth() * 0.5f - clothWidth * clothSpacing * 0.5f;
  int startY = renderer->GetWindowHeight() * 0.1f;

  cloth = new Cloth(clothWidth, clothHeight, clothSpacing, startX, startY);

  lastUpdateTime = SDL_GetTicks();
}




Cloth::Cloth(int width, int height, int spacing, int startX, int startY) {
  for (int y = 0; y <= height; y++) {
    for (int x = 0; x <= width; x++) {
      Point* point = new Point(startX + x * spacing, startY + y * spacing);
      
      if (x != 0) {
        Point* leftPoint = points[this->points.size() - 1];
        Stick* s = new Stick(*point, *leftPoint, spacing);
        leftPoint->AddStick(s, 0);
        point->AddStick(s, 0);
        sticks.push_back(s);
      }
      
      if (y != 0) {
        Point* upPoint = points[x + (y - 1) * (width + 1)];
        Stick* s = new Stick(*point, *upPoint, spacing);
        upPoint->AddStick(s, 1);
        point->AddStick(s, 1);
        sticks.push_back(s);
      }
      
      if (y == 0 && x % 2 == 0) {
        point->Pin();
      }
      
      points.push_back(point);
    }
  }
}



void Cloth::Update(Renderer* renderer, Mouse* mouse, float deltaTime) {
  for (int i = 0; i < points.size(); i++) {
    points[i]->Update(deltaTime, drag, gravity, elasticity, mouse, renderer->GetWindowWidth(), renderer->GetWindowHeight());
  }
  for (int i = 0; i < sticks.size(); i++) {
    sticks[i]->Update();
  }
}

void Cloth::Draw(Renderer* renderer) const {
  for (int i = 0; i < sticks.size(); i++) {
    sticks[i]->Draw(renderer);
  }
}



class Point {
  private:
    Stick* sticks[2] = { nullptr };

    Vec2 pos;
    Vec2 prevPos;
    Vec2 initPos;
    bool isPinned = false;

    bool isSelected = false;

    void KeepInsideView(int width, int height);

  public:
    Point() = default;
    Point(float x, float y);
    ~Point() = default;

    void AddStick(Stick* stick, int index);

    const Vec2& GetPosition() const { return pos; }
    void SetPosition(float x, float y);

    void Pin();

    void Update(float deltaTime, float drag, const Vec2& acceleration, float elasticity, Mouse* mouse, int windowWidth, int windowHeight);
};




void Point::Update(float deltaTime, float drag, const Vec2& acceleration, float elasticity, Mouse* mouse, int windowWidth, int windowHeight) {
  Vec2 mouseDir = pos - mouse->GetPosition();
  float mouseDist = sqrtf(mouseDir.x * mouseDir.x + mouseDir.y * mouseDir.y);
  isSelected = mouseDist < mouse->GetCursorSize();

  for (Stick* stick : sticks) {
    if (stick != nullptr) {
      stick->SetIsSelected(isSelected);
    }
  }

  if (mouse->GetLeftButtonDown() && isSelected) {
    Vec2 difference = mouse->GetPosition() - mouse->GetPreviousPosition();
    if (difference.x > elasticity) difference.x = elasticity;
    if (difference.y > elasticity) difference.y = elasticity;
    if (difference.x < -elasticity) difference.x = -elasticity;
    if (difference.y < -elasticity) difference.y = -elasticity;
    prevPos = pos - difference;
  }

  if (mouse->GetRightMouseButton() && isSelected) {
    for (Stick* stick : sticks) {
      if (stick != nullptr) {
        stick->Break();
      }
    }
  }

  if (isPinned) {
    pos = initPos;
    return;
  }

  Vec2 newPos = pos + (pos - prevPos) * (1.0f - drag) + acceleration * (1.0f - drag) * deltaTime * deltaTime;
  prevPos = pos;
  pos = newPos;

  KeepInsideView(windowWidth, windowHeight);
}




Vec2 newPos = pos + (pos - prevPos) * (1.0f - drag) + acceleration * (1.0f - drag) * deltaTime * deltaTime;
prevPos = pos;
pos = newPos;


if (isPinned) {
  pos = initPos;
  return;
}


#include "Mouse.h"

void Mouse::IncreaseCursorSize(float increment) {
  if (cursorSize + increment > maxCursorSize || cursorSize + increment < minCursorSize) {
    return;
  }
  cursorSize += increment;
}

void Mouse::UpdatePosition(int x, int y) {
  prevPos.x = pos.x;
  prevPos.y = pos.y;
  pos.x = x;
  pos.y = y;
}


void Application::Input() {
  SDL_Event event;
  while (SDL_PollEvent(&event)) {
    switch (event.type) {
      case SDL_QUIT:
        isRunning = false;
        break;
      case SDL_KEYDOWN:
        if (event.key.keysym.sym == SDLK_ESCAPE) {
          isRunning = false;
        }
        break;
      case SDL_MOUSEMOTION:
        int x = event.motion.x;
        int y = event.motion.y;
        mouse->UpdatePosition(x, y);
        break;
      case SDL_MOUSEBUTTONDOWN:
        int x, y;
        SDL_GetMouseState(&x, &y);
        mouse->UpdatePosition(x, y);

        if (!mouse->GetLeftButtonDown() && event.button.button == SDL_BUTTON_LEFT) {
          mouse->SetLeftMouseButton(true);
        }
        if (!mouse->GetRightMouseButton() && event.button.button == SDL_BUTTON_RIGHT) {
          mouse->SetRightMouseButton(true);
        }
        break;
      case SDL_MOUSEBUTTONUP: 
        if (mouse->GetLeftButtonDown() && event.button.button == SDL_BUTTON_LEFT) {
          mouse->SetLeftMouseButton(false);
        }
        if (mouse->GetRightMouseButton() && event.button.button == SDL_BUTTON_RIGHT) {
          mouse->SetRightMouseButton(false);
        }
        break;
      case SDL_MOUSEWHEEL:
        if (event.wheel.y > 0) {
          mouse->IncreaseCursorSize(10);
        } else if (event.wheel.y < 0) {
          mouse->IncreaseCursorSize(-10);
        }
        break;
    }
  }
}








Vec2 cursorToPosDir = pos - mouse->GetPosition();
float cursorToPosDist = cursorToPosDir.x * cursorToPosDir.x + cursorToPosDir.y * cursorToPosDir.y;
float cursorSize = mouse->GetCursorSize();
isSelected = cursorToPosDist < cursorSize * cursorSize;


for (Stick* stick : sticks) {
  if (stick != nullptr) {
    stick->SetIsSelected(isSelected);
  }
}


if (mouse->GetLeftButtonDown() && isSelected) {
  Vec2 difference = mouse->GetPosition() - mouse->GetPreviousPosition();
  if (difference.x > elasticity) difference.x = elasticity;
  if (difference.y > elasticity) difference.y = elasticity;
  if (difference.x < -elasticity) difference.x = -elasticity;
  if (difference.y < -elasticity) difference.y = -elasticity;
  prevPos = pos - difference;
}



if (mouse->GetRightMouseButton() && isSelected) {
  for (Stick* stick : sticks) {
    if (stick != nullptr) {
      stick->Break();
    }
  }
}




#include "Renderer.h"

class Point;

class Stick {
  private:
    Point& p0;
    Point& p1;
    float length;

    bool isActive = true;
    bool isSelected = false;

    Uint32 color = 0xFF000000;
    Uint32 colorWhenSelected = 0xFFCC0000;

  public:
    Stick(Point& p0, Point& p1, float lenght);
    ~Stick() = default;
    void SetIsSelected(bool value);
    void Update();
    void Draw(const Renderer* renderer) const;
    void Break();
};


void Stick::Update() {
  if (!isActive)
    return;
  
  Vec2 p0Pos = p0.GetPosition();
  Vec2 p1Pos = p1.GetPosition();

  Vec2 diff = p0Pos - p1Pos;
  float dist = sqrtf(diff.x * diff.x + diff.y * diff.y);
  float diffFactor = (length - dist) / dist;
  Vec2 offset = diff * diffFactor * 0.5f;

  p0.SetPosition(p0Pos.x + offset.x, p0Pos.y + offset.y);
  p1.SetPosition(p1Pos.x - offset.x, p1Pos.y - offset.y);
}

void Stick::Draw(const Renderer* renderer) const {
  if (!isActive)
    return;

  Vec2 p0Pos = p0.GetPosition();
  Vec2 p1Pos = p1.GetPosition();

  renderer->DrawLine(p0Pos.x, p0Pos.y, p1Pos.x, p1Pos.y, isSelected ? colorWhenSelected : color);
}